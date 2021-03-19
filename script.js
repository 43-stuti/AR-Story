// Markers can be found at https://github.com/iondrimba/augmented-reality

//importing the animation
import data from './animate.js'
class App {
    init() {
       this.data = data;

      
      console.log('data',this.data);
      //this.icosahedron = this.getIcosahedron(0xff005c);
      //this.velocity = .08;
      //this.angle = 0;
  
      //attaching the pattern to a mesh
      this.patterns = [{
        id: 'pattern1',
        mesh: this.getSphere()
      }];
  
      //3 js setting
      this.createScene()
      this.createCamera();
     // this.addAmbientLight();
      this.addSpotLight();
      this.addRectLight();
  //marker set up
      this.setupARToolkitContext();
      this.setupARToolkitSource();
      this.mapMarkersWithMeshes();
  
      this.animate();
    }
  
    createScene() {
      this.scene = new THREE.Scene();
  
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setClearColor(0x000000, 0);
      this.renderer.setSize(640, 480);
      console.log('document',document.body)
      document.body.appendChild(this.renderer.domElement)
      //document.body.appendChild(this.renderer.domElement);
    }
  
    createCamera() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
      this.camera.position.z = 5;
      //this.camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 1, 1000);
      //this.camera.position.set(0,0,200)
      this.camera.lookAt(this.scene.position);
      this.scene.add(this.camera);
    }
    createCanvasTexture() {
    const canvas = document.createElement( 'canvas' );
    canvas.width = 1024;
		canvas.height = 1024;
		const context = canvas.getContext( '2d' );
		
		const animation = bodymovin.loadAnimation( {
			container: document.getElementById( 'bm' ),
			renderer: 'canvas',
			rendererSettings: {
				context: context
			},
			loop: true,
			autplay: true,
			animationData: json
		} );

		const texture = new THREE.CanvasTexture( canvas );
    }
    addRectLight() {
      const rectLight = new THREE.RectAreaLight('#0077ff', 1, 2000, 2000);
  
      rectLight.position.set(5, 50, 0);
      rectLight.lookAt(0, 0, 0);
  
      this.scene.add(rectLight);
    }
  
    addSpotLight() {
      const spotLight = new THREE.SpotLight(0xffffff);
  
      spotLight.position.set(0, 50, 0);
      spotLight.castShadow = true;
  
      this.scene.add(spotLight);
    }
  
    addAmbientLight() {
      this.scene.add(new THREE.AmbientLight(0xffffff));
    }
  
    setupARToolkitContext() {
      this.arToolkitContext = new THREEx.ArToolkitContext({
        debug: true,
        cameraParametersUrl: 'https://iondrimba.github.io/augmented-reality/public/data/camera_para.dat',
        detectionMode: 'mono'
      });
  
      this.arToolkitContext.init(() => {
        this.camera.projectionMatrix.copy(this.arToolkitContext.getProjectionMatrix());
      });
    }
  
    setupARToolkitSource() {
      this.arToolkitSource = new THREEx.ArToolkitSource({
        sourceType: 'webcam',
      });
  
      this.arToolkitSource.init(() => {
        this.onResize();
      });
    }
    getIcosahedron(color = 0x00ff00) {
      const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshPhysicalMaterial({
        color,
        metalness: .58,
        emissive: '#000000',
        roughness: .18,
      }));
  
      mesh.position.set(0, 0, 0);
  
      return mesh;
    }
  
    getSphere() {
    const canvas = document.createElement( 'canvas' );
    canvas.width = 1024;
    canvas.height = 1024;
    const context = canvas.getContext( '2d' );
    
    const animation = bodymovin.loadAnimation( {
        container: document.getElementById( 'bm' ),
        renderer: 'canvas',
        rendererSettings: {
            context: context
        },
        loop: true,
        autplay: true,
        animationData: this.data
    } );

    const texture = new THREE.CanvasTexture( canvas );
    const material = new THREE.MeshBasicMaterial( { map: texture , side: THREE.DoubleSide} )
    
    
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry( 3, 5, 5 ), material);
    mesh.position.set(0, 2, 0);
  
    return mesh;
    }
  
    getHole() {
      const group = new THREE.Group();
      const cube = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshPhysicalMaterial({ color: 0xffffff, side: THREE.BackSide, transparent: true }));
      cube.position.y = -1
  
      group.add(cube);
  
      const geometry = new THREE.PlaneGeometry(18, 18, 9, 9);
      geometry.faces.splice(80, 2);
      geometry.faceVertexUvs[0].splice(80, 2);
  
      const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ colorWrite: false }));
      mesh.rotation.x = -Math.PI / 2;
  
      group.add(mesh);
  
      this.icosahedron = this.getIcosahedron(0xff005c);
      this.icosahedron.position.y = -.5;
      this.icosahedron.scale.set(.5, .5, .5);
  
      group.add(this.icosahedron);
  
      return group;
    }
  
    mapMarkersWithMeshes() {
      this.patterns.map((pattern) => {
        const markerRoot = new THREE.Group();
        markerRoot.add(pattern.mesh);
        markerRoot.name = 'LAME'
        this.scene.add(markerRoot);
  
        var x = new THREEx.ArMarkerControls(this.arToolkitContext, markerRoot, {
          type: 'pattern', patternUrl: './pattern1.patt'
        })
        markerRoot.add(pattern.mesh);
      });
    }
  
    onResize() {
      this.arToolkitSource.onResizeElement();
      this.arToolkitSource.copyElementSizeTo(this.renderer.domElement);
  
      if (this.arToolkitContext.arController) {
        this.arToolkitSource.copyElementSizeTo(this.arToolkitContext.arController.canvas)
      }
    }
  
    animate() {
      this.renderer.render(this.scene, this.camera);
  
      //this.patterns[0].mesh.rotation.y += .05;
  
      //this.patterns[0].mesh.rotation.y -= .008;
  
  
      if (this.arToolkitSource && this.arToolkitSource.ready) {
        console.log('ARE WE READY')
        this.arToolkitContext.update(this.arToolkitSource.domElement);
      }
      this.patterns[0].mesh.material.map.needsUpdate = true;
      this.angle += this.velocity;
       console.log(this.scene.children)
      requestAnimationFrame(this.animate.bind(this));
    }
  }
  
  (function(window, document, undefined){
    window.onload = () => {
        new App().init();
    }
    
    })(window, document, undefined);