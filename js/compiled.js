'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var infoShown = false;
var vidShown = false;

var Globe = function () {
    function Globe(radius, x, y, z) {
        _classCallCheck(this, Globe);

        var map = new THREE.TextureLoader().load('./images/earthbw.png');
        var material = new THREE.MeshPhongMaterial({
            map: map,
            color: 0xDDDDDD
        });
        this.globe = new THREE.Mesh(new THREE.SphereGeometry(radius, 50, 50), material);
        this.globe.position.set(x, y, z);
        this.globe.userData.id = 'globe';
    }

    _createClass(Globe, [{
        key: 'addMesh',
        value: function addMesh() {
            return this.globe;
        }
    }]);

    return Globe;
}();

var Pin = function () {
    function Pin(id, x, y, z) {
        _classCallCheck(this, Pin);

        var material = new THREE.MeshPhongMaterial({
            color: 0x770000
        });
        this.pin = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0, 0.8, 40), material);
        var sphere = new THREE.Mesh(new THREE.SphereGeometry(0.1, 40, 40), material);
        sphere.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0.4, 0));
        this.pin.add(sphere);
        this.pin.userData.id = id;
        this.pin.userData.type = "pin";
        var direction = new THREE.Vector3(x, y, z);
        var arrow = new THREE.ArrowHelper(direction.clone().normalize(), direction);
        var rotation = new THREE.Euler().setFromQuaternion(arrow.quaternion);
        this.pin.rotateX(rotation.x);
        this.pin.rotateY(rotation.y);
        this.pin.rotateZ(rotation.z);
        this.pin.position.set(x, y, z);
    }

    _createClass(Pin, [{
        key: 'addMesh',
        value: function addMesh() {
            return this.pin;
        }
    }]);

    return Pin;
}();

var Info = function () {
    function Info() {
        _classCallCheck(this, Info);

        this.info = document.createElement('div');
        this.info.id = 'info';
    }

    _createClass(Info, [{
        key: 'showInfo',
        value: function showInfo() {
            infoShown = true;
            return this.info;
        }
    }]);

    return Info;
}();

var Video = function () {
    function Video(src) {
        _classCallCheck(this, Video);

        this.video = document.createElement('div');
        this.video.id = 'video';
        var vidframe = document.createElement('iframe');
        vidframe.id = 'vidframe';
        vidframe.src = src;
        this.video.appendChild(vidframe);
        this.close = document.createElement('i');
        this.close.id = 'videoclose';
        this.close.className = 'fa fa-2x fa-times';
        this.close.ariaHidden = 'true';
        this.video.appendChild(this.close);
    }

    _createClass(Video, [{
        key: 'showVideo',
        value: function showVideo() {
            return this.video;
        }
    }, {
        key: 'removeVideo',
        value: function removeVideo() {
            vidShown = false;
            this.video.parentNode.removeChild(this.video);
        }
    }]);

    return Video;
}();

var Scene = function () {
    function Scene() {
        _classCallCheck(this, Scene);

        this.createScene();
        this.addLights();
        this.animate();
        this.preload();
    }

    _createClass(Scene, [{
        key: 'createScene',
        value: function createScene() {
            this.mouse = new THREE.Vector2();
            this.raycaster = new THREE.Raycaster();
            this.scene = new THREE.Scene();
            this.container = document.getElementById('container');
            this.camera = new THREE.PerspectiveCamera(60, this.container.clientWidth / this.container.clientHeight, 0.2, 200);
            this.camera.position.set(0, 5, 10);
            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.renderer.setClearColor(0xffffff);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.container.appendChild(this.renderer.domElement);
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.scene.add(this.camera);
            this.container.addEventListener('mousedown', this.mouseClick.bind(this), false);
            this.container.addEventListener('mousemove', this.mouseOver.bind(this), false);
            this.city = document.createElement('div');
            this.city.id = 'city';
            this.container.appendChild(this.city);
        }
    }, {
        key: 'loadJSON',
        value: function loadJSON(callback) {
            var req = new XMLHttpRequest();
            req.open('GET', './js/cityinfo.json', true);
            req.onreadystatechange = function () {
                if (req.readyState == 4 && req.status == "200") {
                    callback(req.responseText);
                }
            };
            req.send(null);
        }
    }, {
        key: 'preload',
        value: function preload() {
            this.loadJSON(function (response) {
                var data = JSON.parse(response);
                var images = [];
                for (var city in data) {
                    for (var show in data[city]) {
                        for (var logo in data[city][show]) {
                            if (logo === 'logo') {
                                images[logo] = new Image();
                                images[logo].src = data[city][show][logo];
                            }
                        }
                    }
                }
            });
        }
    }, {
        key: 'mouseOver',
        value: function mouseOver(event) {
            this.mouse.x = event.clientX / this.container.clientWidth * 2 - 1;
            this.mouse.y = -(event.clientY / this.container.clientHeight) * 2 + 1;
            this.raycaster.setFromCamera(this.mouse, this.camera);

            var intersects = this.raycaster.intersectObjects(this.scene.children);
            if (!infoShown && intersects[0] && intersects[0].object.userData.type === 'pin') {
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
    }, {
        key: 'mouseClick',
        value: function mouseClick(event) {
            var _this = this;

            this.mouse.x = event.clientX / this.container.clientWidth * 2 - 1;
            this.mouse.y = -(event.clientY / this.container.clientHeight) * 2 + 1;
            this.raycaster.setFromCamera(this.mouse, this.camera);

            if (infoShown === true) {
                if (event.target.tagName.toLowerCase() !== 'img') {
                    infoShown = false;
                    this.info.parentNode.removeChild(this.info);
                }
            }

            var intersects = this.raycaster.intersectObjects(this.scene.children);
            var city_name = void 0;
            this.loadJSON(function (response) {
                var data = JSON.parse(response);
                if (infoShown === false) {
                    if (intersects[0] && intersects[0].object.userData.type === 'pin') {
                        infoShown = true;
                        _this.addInfo(new Info());
                        _this.info = document.getElementById('info');
                        city_name = intersects[0].object.userData.id;
                        var ul = document.createElement("ul");
                        for (var show in data[city_name]) {
                            var li = document.createElement("li");
                            li.className = "show";
                            var img = document.createElement("img");
                            img.src = data[city_name][show].logo;
                            img.className = city_name;
                            img.id = show;
                            li.appendChild(img);
                            ul.appendChild(li);
                        }
                        _this.info.appendChild(ul);
                        _this.city.style.display = 'none';
                        document.body.style.cursor = 'default';
                    }
                }
                if (event.target.tagName.toLowerCase() === 'img') {
                    vidShown = true;
                    var city = event.target.className;
                    for (var _show in data[city]) {
                        if (_show === event.target.id) {
                            _this.addVideo(new Video(data[city][_show].video));
                            _this.more = document.createElement('a');
                            _this.more.id = 'more';
                            var text = document.createTextNode('More Videos >');
                            _this.more.setAttribute('href', data[city][_show].more);
                            _this.more.appendChild(text);
                        }
                    }
                    _this.video = document.getElementById('video');
                    _this.video.appendChild(_this.more);
                    var vidframe = document.getElementById('vidframe');
                }
            });
        }
    }, {
        key: 'resize',
        value: function resize() {
            this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
            if (infoShown === true) {
                var width = this.container.clientWidth / 2 - 150;
                var height = this.container.clientHeight / 2 - this.info.offsetHeight / 2;
                this.info.style.top = height + 'px';
                this.info.style.left = width + 'px';
            }
            if (vidShown === true) {
                var _width = this.container.clientWidth / 2 - this.video.offsetWidth / 2;
                var _height = this.container.clientHeight / 2 - this.video.offsetHeight / 2;
                this.video.style.top = _height + 'px';
                this.video.style.left = _width + 'px';
            }
        }
    }, {
        key: 'addLights',
        value: function addLights() {
            this.ambientLight = new THREE.AmbientLight(0xaaaaaa);
            this.scene.add(this.ambientLight);
            this.light = new THREE.PointLight(0xffffff, 1, 50);
            this.light.position.set(0, 5, 11);
            this.camera.add(this.light);
        }
    }, {
        key: 'animate',
        value: function animate() {
            var _this2 = this;

            requestAnimationFrame(function () {
                _this2.animate();
            });
            if (infoShown === true) {
                if (vidShown === true) {
                    this.info.style.display = 'none';
                } else {
                    this.info.style.display = 'block';
                }
            }
            this.controls.update();
            window.addEventListener('resize', this.resize(), false);
            this.render();
        }
    }, {
        key: 'render',
        value: function render() {
            this.renderer.render(this.scene, this.camera);
        }
    }, {
        key: 'add',
        value: function add(mesh) {
            this.scene.add(mesh.addMesh());
        }
    }, {
        key: 'addInfo',
        value: function addInfo(info) {
            this.container.appendChild(info.showInfo());
        }
    }, {
        key: 'addVideo',
        value: function addVideo(video) {
            this.container.appendChild(video.showVideo());
            document.getElementById('videoclose').onclick = function () {
                video.removeVideo();
            };
        }
    }]);

    return Scene;
}();

var scene = new Scene();
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

var container = document.getElementById('container');
var instructions = document.createElement('div');
instructions.className = 'instructions';
instructions.innerHTML = 'Click and drag to move. Click the pins to see our videos.';
container.appendChild(instructions);
