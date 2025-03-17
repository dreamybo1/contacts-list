let scene, camera, renderer, particles;
let mouseX, mouseY
let velocities = []; // Массив для хранения скоростей каждой частицы

function init() {
    const canvas = document.getElementById("sceneCanvas");

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        75, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];

    // Создаем 300 частиц со случайными позициями и скоростями
    for (let i = 0; i < 300; i++) {
        let x = (Math.random() - 0.5) * 15;
        let y = (Math.random() - 0.5) * 15;
        let z = (Math.random() - 0.5) * 15;
        vertices.push(x, y, z);

        // Присваиваем случайный цвет каждой частице
        colors.push(Math.random(), Math.random(), Math.random());

        // Генерируем случайную скорость для частицы
        // Умножение на 0.01 задает небольшое значение для плавного движения
        velocities.push(
            (Math.random() - 0.5) * 0.01,
            (Math.random() - 0.5) * 0.01,
            (Math.random() - 0.5) * 0.01
        );
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.12,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    animate();
}

function animate() {
    requestAnimationFrame(animate);

    if (!!mouseX && !!mouseY) {

        const positions = particles.geometry.attributes.position.array;
    
        particles.rotation.y += (mouseX * 0.0005 - particles.rotation.y) * 0.55;
        particles.rotation.x += (mouseY * 0.0005 - particles.rotation.x) * 0.55;
    
        // Обновляем позицию каждой частицы согласно её скорости
        for (let i = 0; i < positions.length; i += 3) {
            positions[i]     += velocities[i];     // X
            positions[i + 1] += velocities[i + 1]; // Y
            positions[i + 2] += velocities[i + 2]; // Z
    
            // Если частица выходит за пределы, инвертируем скорость по соответствующей оси
            if (positions[i] > 7.5 || positions[i] < -7.5) {
                velocities[i] = -velocities[i];
            }
            if (positions[i + 1] > 7.5 || positions[i + 1] < -7.5) {
                velocities[i + 1] = -velocities[i + 1];
            }
            if (positions[i + 2] > 7.5 || positions[i + 2] < -7.5) {
                velocities[i + 2] = -velocities[i + 2];
            }
        }
        // Обновляем атрибут позиций, чтобы Three.js заново отрисовал частицы
        particles.geometry.attributes.position.needsUpdate = true;
    
        renderer.render(scene, camera);
    }
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Если понадобится добавить реакцию на движение мыши (необязательно)
document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX - window.innerWidth / 2;
    mouseY = event.clientY - window.innerHeight / 2;
});

init();
