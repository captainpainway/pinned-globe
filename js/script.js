let infoShown = false;
let vidShown = false;

class Globe {
    constructor(radius, x, y, z) {
        const map = new THREE.TextureLoader().load('./images/earthbw.png');
        let material = new THREE.MeshPhongMaterial({
            map: map,
            color: 0xDDDDDD
        });
        this.globe = new THREE.Mesh(
            new THREE.SphereGeometry(radius, 50, 50),
            material
        )
        this.globe.position.set(x, y, z);
        this.globe.userData.id = 'globe';
    }
    addMesh() {
        return this.globe;
    }
}

class Pin {
    constructor(id, x, y, z) {
        const material = new THREE.MeshPhongMaterial({
            color: 0x770000
        });
        this.pin = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0, 0.8, 40),
            material
        )
        let sphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 40, 40),
            material
        );
        sphere.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0.4, 0));
        this.pin.add(sphere);
        this.pin.userData.id = id;
        this.pin.userData.type = "pin";
        let direction = new THREE.Vector3(x, y, z);
        let arrow = new THREE.ArrowHelper(direction.clone().normalize(), direction);
        let rotation = new THREE.Euler().setFromQuaternion(arrow.quaternion);
        this.pin.rotateX(rotation.x);
        this.pin.rotateY(rotation.y);
        this.pin.rotateZ(rotation.z);
        this.pin.position.set(x, y, z);
    }
    addMesh() {
        return this.pin;
    }
}

class Info {
    constructor() {
        this.info = document.createElement('div');
        this.info.id = 'info';
    }
    showInfo() {
        infoShown = true;
        return this.info;
    }
}

class Video {
    constructor(src) {
        this.video = document.createElement('div');
        this.video.id = 'video';
        let vidframe = document.createElement('iframe');
        vidframe.id = 'vidframe';
        vidframe.src = src;
        this.video.appendChild(vidframe);
        this.close = document.createElement('i');
        this.close.id = 'videoclose';
        this.close.className = 'fa fa-2x fa-times';
        this.close.ariaHidden = 'true';
        this.video.appendChild(this.close);
    }
    showVideo() {
        return this.video;
    }
    removeVideo() {
        vidShown = false;
        this.video.parentNode.removeChild(this.video);
    }
}

class Scene {
    constructor() {
        this.createScene();
        this.addLights();
        this.animate();
        this.preload();
    }
    createScene() {
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.scene = new THREE.Scene();
        this.container = document.getElementById('container');
        this.camera = new THREE.PerspectiveCamera(
            60,
            this.container.clientWidth/this.container.clientHeight,
            0.2,
            200
        );
        this.camera.position.set(0, 5, 10);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setClearColor(0xffffff);
        this.renderer.setPixelRatio(window.devicePixelRatio);
		this.container.appendChild(this.renderer.domElement);
        this.controls = new THREE.OrbitControls(
            this.camera,
            this.renderer.domElement
        );
        this.scene.add(this.camera);
        this.container.addEventListener( 'mousedown', this.mouseClick.bind(this), false );
        this.container.addEventListener( 'mousemove', this.mouseOver.bind(this), false );
        this.city = document.createElement('div');
        this.city.id = 'city';
        this.container.appendChild(this.city);
    }
    loadJSON(callback) {
        let req = new XMLHttpRequest();
        req.open('GET', './js/cityinfo.json', true);
        req.onreadystatechange = function () {
            if (req.readyState == 4 && req.status == "200") {
                callback(req.responseText);
            }
        };
        req.send(null);
    }
    preload() {
        this.loadJSON((response) => {
            let data = JSON.parse(response);
            let images = [];
            for(let city in data) {
                for(let show in data[city]) {
                    for(let logo in data[city][show]) {
                        if(logo === 'logo') {
                            images[logo] = new Image();
                            images[logo].src = data[city][show][logo];
                        }
                    }
                }
            }
        });
    }
    mouseOver(event) {
        this.mouse.x = ( event.clientX / this.container.clientWidth ) * 2 - 1;
    	this.mouse.y = - ( event.clientY / this.container.clientHeight ) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);

        let intersects = this.raycaster.intersectObjects(this.scene.children);
        if(!infoShown && intersects[0] && intersects[0].object.userData.type === 'pin') {
            this.city.style.top = event.clientY + 10 + 'px';
            this.city.style.left = event.clientX + 10 + 'px';
            this.city.innerHTML = '';
            this.city.innerHTML = intersects[0].object.userData.id;
            this.city.style.display = 'block';
            this.city.style.padding = '10px';
            this.city.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.5)';
            document.body.style.cursor = 'pointer';
        } else {
            this.city.style.display = 'none';
            document.body.style.cursor = 'default';
        }
    }
    mouseClick(event) {
        this.mouse.x = ( event.clientX / this.container.clientWidth ) * 2 - 1;
    	this.mouse.y = - ( event.clientY / this.container.clientHeight ) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);

        if(infoShown === true) {
            if(event.target.tagName.toLowerCase() !== 'img') {
                infoShown = false;
                this.info.parentNode.removeChild(this.info);
            }
        }

        let intersects = this.raycaster.intersectObjects(this.scene.children);
        let city_name;
        this.loadJSON((response) => {
            let data = JSON.parse(response);
            if(infoShown === false) {
                if(intersects[0] && intersects[0].object.userData.type === 'pin') {
                    infoShown = true;
                    this.addInfo(new Info());
                    this.info = document.getElementById('info');
                    city_name = intersects[0].object.userData.id;
                    const ul = document.createElement("ul");
                    for (const show in data[city_name]) {
                        const li = document.createElement("li");
                        li.className = "show";
                        const img = document.createElement("img");
                        img.src = data[city_name][show].logo;
                        img.className = city_name;
                        img.id = show;
                        li.appendChild(img);
                        ul.appendChild(li);
                    }
                    this.info.appendChild(ul);
                    this.city.style.display = 'none';
                    document.body.style.cursor = 'default';
                }
            }
            if(event.target.tagName.toLowerCase() === 'img') {
                vidShown = true;
                let city = event.target.className;
                for (const show in data[city]) {
                    if (show === event.target.id) {
                        this.addVideo(new Video(data[city][show].video));
                        this.more = document.createElement('a');
                        this.more.id = 'more';
                        let text = document.createTextNode('More Videos >');
                        this.more.setAttribute('href', data[city][show].more);
                        this.more.appendChild(text);
                    }
                }
                this.video = document.getElementById('video');
                this.video.appendChild(this.more);
                const vidframe = document.getElementById('vidframe');
            }
        });
    }
    resize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
		this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        if (infoShown === true) {
            let width = (this.container.clientWidth / 2) - 150;
            let height = (this.container.clientHeight / 2) - (this.info.offsetHeight / 2);
            this.info.style.top = height + 'px';
            this.info.style.left = width + 'px';
        }
        if (vidShown === true) {
            let width = (this.container.clientWidth / 2) - (this.video.offsetWidth / 2);
            let height = (this.container.clientHeight / 2) - (this.video.offsetHeight / 2);
            this.video.style.top = height + 'px';
            this.video.style.left = width + 'px';
        }
    }
    addLights() {
        this.ambientLight = new THREE.AmbientLight(0xaaaaaa);
        this.scene.add(this.ambientLight);
        this.light = new THREE.PointLight(0xffffff, 1, 50);
        this.light.position.set(0, 5, 11);
        this.camera.add(this.light);
    }
    animate() {
        requestAnimationFrame(() => {
            this.animate();
        });
        if(infoShown === true) {
            if(vidShown === true) {
                this.info.style.display = 'none';
            } else {
                this.info.style.display = 'block';
            }
        }
        this.controls.update();
        window.addEventListener('resize', this.resize(), false);
        this.render();
    }
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    add(mesh) {
        this.scene.add(mesh.addMesh());
    }
    addInfo(info) {
		this.container.appendChild(info.showInfo());
    }
    addVideo(video) {
		this.container.appendChild(video.showVideo());
        document.getElementById('videoclose').onclick = () => {
            video.removeVideo();
        };
    }
}

let scene = new Scene();
scene.add(new Globe(5, 0, 0, 0));
scene.add(new Pin('Orlando', 0.7, 2.5, 4.6));
scene.add(new Pin('New York City', 1.1, 3.45, 3.85));
scene.add(new Pin('Washington DC', 0.9, 3.35, 4));
scene.add(new Pin('Mumbai', 1.46, 1.78, -4.75));
scene.add(new Pin('Delhi', 1.07, 2.43, -4.55));
scene.add(new Pin('Hyderabad', 1.07, 1.52, -4.9));
scene.add(new Pin('Chicago', 0.15, 3.55, 3.95));
scene.add(new Pin('Beijing', -1.8, 3.45, -3.6));
scene.add(new Pin('Dhaka', 0, 2.2, -4.8));
scene.add(new Pin('Pune', 1.38, 1.65, -4.85));

let container = document.getElementById('container');
let instructions = document.createElement('div');
instructions.className = 'instructions';
instructions.innerHTML = 'Click and drag to move. Click the pins to see our videos.';
container.appendChild(instructions);
