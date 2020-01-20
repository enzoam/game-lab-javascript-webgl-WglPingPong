var renderer, scene, camera, pointLight, spotLight; // Objetos
var fieldWidth = 300, fieldHeight = 150; // Limites
var RaqueteLargura, RaqueteAltura, RaqueteDepth, RaqueteResolucao;
var RaquetePlayer1DirY = 0, RaqueteCPUDirY = 0, VelocidadeRaquete = 3;
var bola, RaquetePlayer1, RaqueteCPU;// variaveis da Bola
var bolaDirX = 1, bolaDirY = 1, VelocidadeBola = 2;// variaveis da Bola

var Pontuacao1 = 0, Pontuacao2 = 0; // SCORE
var maxScore = 10; // SCORE MAXIMO
var dificuldade = 0.05; // REFLEXOS DO CPU MINIMO 0 MAXIMO 1

var audio = document.createElement('audio');
var source = document.createElement('source');
var audio2 = document.createElement('audio');
var source2 = document.createElement('source');
source.src = 'pop.wav';
source2.src = 'pop2.wav';
audio.appendChild(source);
audio2.appendChild(source2);

function setup()
{
	document.getElementById("winnerBoard").innerHTML = "OBJETIVO " + maxScore + " ACERTOS - A (ESQUERDA) - D (DIREITA)";

	Pontuacao1 = 0;
	Pontuacao2 = 0;

	createScene();
	draw();
}

function createScene()
{
	var WIDTH = 800, HEIGHT = 360; // TELA
	var VIEW_ANGLE = 50, ASPECT = WIDTH / HEIGHT, NEAR = 0.5, FAR = 10000;	// CAMERA
	var c = document.getElementById("gameCanvas");

	renderer = new THREE.WebGLRenderer(); 	// CRIAR CAMERA
	camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);

	scene = new THREE.Scene(); // SCENE
    scene.add(camera);

	camera.position.z = 320; // POSICAO INICIAL DA CAMERA
	renderer.setSize(WIDTH, HEIGHT);
    c.appendChild(renderer.domElement);

	var planeWidth = fieldWidth,
        planeHeight = fieldHeight,
		planeQuality = 10;	// CONFIGURACAO DA SUPERFICIE PLANA

	//var RaquetePlayer1Material = new THREE.MeshLambertMaterial({color:  0xffff00}); // CRIACAO DO MATERIAL PARA O PLAYER 1
    var RaquetePlayer1Material = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture('img/raquete1.jpg') } );
	//var RaqueteCPUMaterial = new THREE.MeshLambertMaterial({color:  0x000080}); // CRIACAO DO MATERIAL PARA O CPU
    var RaqueteCPUMaterial = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture('img/raquete2.jpg') } );
    //var planeMaterial   = new THREE.MeshLambertMaterial({color:  0x006400}); // CRIACAO DO MATERIAL DA MESA
    var planeMaterial = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture('img/mesa.jpg') } );
    //var netMaterial     = new THREE.MeshLambertMaterial({color:  0xff0000}); // CRIACAO DO MATERIAL DA REDE
    var netMaterial = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture('img/rede.jpg') } );
	//var mesaMaterial   = new THREE.MeshLambertMaterial({color:  0x00008B}); // CRIACAO DO MATERIAL 2 DA MESA
    var mesaMaterial = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture('img/mesa.jpg') } );
	//var chaoMaterial  = new THREE.MeshLambertMaterial({color:  0x3d2570}); // CRIACAO DO MATERIAL DO CHÃO
    var chaoMaterial = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture('img/chao.jpg') } );
    //var wallMaterial    = new THREE.MeshLambertMaterial({color:  0xFFFFFF}); // CRIACAO DO MATERIAL DA PAREDE
    var texture = THREE.ImageUtils.loadTexture( "img/parede.jpg" );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1,1);
    var wallMaterial = new THREE.MeshLambertMaterial( { map: texture } );

    var plane           = new THREE.Mesh(
                          new THREE.PlaneGeometry(planeWidth * 0.95,
                                                  planeHeight,
                                                  planeQuality,
		                                          planeQuality),
	                                              planeMaterial);// 95% DA MESA PARA AREA DE MOVIMENTACAO DA BOLA - FORA DISSO É BOLA PERDIDA

	scene.add(plane);
	plane.receiveShadow = true;

	var mesa = new THREE.Mesh(
	  new THREE.CubeGeometry(
		planeWidth * 0.8,	// EXTENÇÃO DA BASE DA MESA
		planeHeight * 0.8,  // EXTENÇÃO DA BASE DA MESA 2
		100,				// ALTURA DA BASE DA MESA
		planeQuality, planeQuality,	1), mesaMaterial);
	mesa.position.z = -51;	// POSICAO DA BASE DA MESA

    scene.add(mesa);
    mesa.receiveShadow = true;

    var net = new THREE.Mesh(
        new THREE.CubeGeometry(
            planeWidth * 0.01,
            planeHeight * 1,
            10,				// ALTURA DA REDE
            planeQuality, planeQuality,	1), netMaterial);
    net.position.z = 10;	// POSICAO DA BASE DA REDE

    scene.add(net);
    net.receiveShadow = true;

	var radius = 6, segments = 10,	rings = 10; // CONFIGURACOES DA BOLA
	var sphereMaterial =  new THREE.MeshLambertMaterial({color: 0xFFFFFF});	// MATERIAL E COR DA BOLA

	bola = new THREE.Mesh(
	  new THREE.SphereGeometry(
		radius,
		segments,
		rings),
	  sphereMaterial); // CONSTROI A FORMA DA BOLA

	scene.add(bola); // INCLUI A BOLA NO JOGO

	bola.position.x = 0; bola.position.y = 0; bola.position.z = radius; // POSICAO INICIAL X Y Z DA BOLA
	bola.receiveShadow = true;
    bola.castShadow = true;

	RaqueteLargura = 5; RaqueteAltura = 40; RaqueteDepth = 30; RaqueteResolucao = 1; // CONFIGURACOES DO PLAYER 1 E CPU

	RaquetePlayer1 = new THREE.Mesh(
	  new THREE.CubeGeometry(
		RaqueteLargura,
		RaqueteAltura,
		RaqueteDepth,
		RaqueteResolucao,
		RaqueteResolucao,
		RaqueteResolucao),
	  RaquetePlayer1Material); // CONSTROI A FORMA DA RAQUETE DO PLAYER 1

	scene.add(RaquetePlayer1); // INCLUI O PLAYER 1 NO JOGO
	RaquetePlayer1.receiveShadow = true;
    RaquetePlayer1.castShadow = true;

	RaqueteCPU = new THREE.Mesh(
	  new THREE.CubeGeometry(
		RaqueteLargura,
		RaqueteAltura,
		RaqueteDepth,
		RaqueteResolucao,
		RaqueteResolucao,
		RaqueteResolucao),
	  RaqueteCPUMaterial); // CONSTROI A FORMA DA RAQUETE DO CPU

	scene.add(RaqueteCPU); // INCLUI O CPU NO JOGO
	RaqueteCPU.receiveShadow = true;
    RaqueteCPU.castShadow = true;

	RaquetePlayer1.position.x = -fieldWidth/2 + RaqueteLargura; RaquetePlayer1.position.z = RaqueteDepth; // POSICAO INICIAL X Y Z DO PLAYER 1
    RaqueteCPU.position.x = fieldWidth/2 - RaqueteLargura; RaqueteCPU.position.z = RaqueteDepth; // POSICAO INICIAL X Y Z DO CPU

	var chao = new THREE.Mesh(
	  new THREE.CubeGeometry(
	  3000,
	  1000,
	  3,
	  1,
	  1,
	  1 ),
	  chaoMaterial); // CONSTROI O CHAO

	chao.position.z = -132; // POSICAO DO CHAO
    chao.receiveShadow = true;
	scene.add(chao); // INCLUI O CHAO NO JOGO

    var wall = new THREE.Mesh(
        new THREE.CubeGeometry(
            planeWidth * 20,	    // EXTENÇÃO DA PAREDE
            planeHeight * 0.1,  // EXTENÇÃO DA PAREDE 2
            2000,				// ALTURA DA PAREDE
            planeQuality, planeQuality,	1), wallMaterial);
    wall.position.z = -50;	// POSICAO DA BASE DA PAREDE
    wall.position.y = 500;	// POSICAO DA BASE DA PAREDE

    scene.add(wall);
    wall.receiveShadow = true;

	pointLight = new THREE.PointLight(0xffd700); // CRIA LUZ DIRECIONAL

	pointLight.position.x = 0;	pointLight.position.y = 0;	pointLight.position.z = 2000; // POSICAO X Y Z DA LUZ DIRECIONAL
	pointLight.intensity = 3.0;
	pointLight.distance = 3000;
	scene.add(pointLight); // INCLUI A LUZ DIRECIONAL NO JOGO

    spotLight = new THREE.SpotLight(0xF8D898); // CRIA PONTO DE LUZ
    spotLight.position.set(0, 0, 500); // POSICAO DA LUZ NA AREA DA CENA
    spotLight.intensity = 1.5;
    spotLight.castShadow = true;

    scene.add(spotLight); // INCLUI O PONTO DE LUZ NO JOGO

	renderer.shadowMapEnabled = true; // SOMBRAS
}

function draw()// draw THREE.JS
{
	renderer.render(scene, camera);
	requestAnimationFrame(draw);

	bolaPhysics();
	RaquetePhysics();
	cameraPhysics();
	playerRaqueteMovement();
	opponentRaqueteMovement();
}

function bolaPhysics()
{
	if (bola.position.x <= -fieldWidth) // SE A BOLA SAIR PELO LADO DO JOGADOR
	{
		Pontuacao2++;  // ADICIONA 1 PONTO A PONTUACAO DO CPU
		document.getElementById("scores").innerHTML = Pontuacao1 + "-" + Pontuacao2; // ATUALIZA O ESCORE NA TELA
		resetbola(2); //ALTERA A POSICAO DA BOLA PARA O CENTRO
		matchScoreCheck();
	}

	if (bola.position.x >= fieldWidth) // SE A BOLA SAIR PELO LADO DO CPU
	{
		Pontuacao1++; // ADICIONA 1 PONTO A PONTUACAO DO PLAYER 1
		document.getElementById("scores").innerHTML = Pontuacao1 + "-" + Pontuacao2; // ATUALIZA O ESCORE NA TELA
		resetbola(1); //ALTERA A POSICAO DA BOLA PARA O CENTRO
		matchScoreCheck();
        dificuldade = dificuldade + 0.01;
	}

	if (bola.position.y <= -fieldHeight/2) 	// SE A BOLA TENTAR SAIR PELA LATERAL
	{
		bolaDirY = -bolaDirY;
	}
	if (bola.position.y >= fieldHeight/2)  // SE A BOLA TENTAR SAIR PELA OUTrA LATERAL
	{
		bolaDirY = -bolaDirY;
	}

	bola.position.x += bolaDirX * VelocidadeBola; bola.position.y += bolaDirY; // ATUALIZA A POSICAO X Y DA BOLA
    if (bola.position.z < 10)
    {
        direcao = 0;
        audio2.play();
    }
    if (bola.position.z > 50)
    {
        direcao = 1;
    }
    if (direcao == 0 && bola.position.x > -150 && bola.position.x < 150)  bola.position.z = bola.position.z + 0.8;
    if (direcao == 1 && bola.position.x > -150 && bola.position.x < 150)  bola.position.z = bola.position.z - 0.8;

	if (bolaDirY > VelocidadeBola * 2) // ALTERAR E LIMITAR A VELOCIDADE DA BOLA
	{
		bolaDirY = VelocidadeBola * 2;
	}
	else if (bolaDirY < -VelocidadeBola * 2)
	{
		bolaDirY = -VelocidadeBola * 2;
	}
}

function opponentRaqueteMovement() // MOVIMENTO DO CPU
{
	RaqueteCPUDirY = (bola.position.y - RaqueteCPU.position.y) * dificuldade; // SEGUE A POSICAO DA BOLA


	if (Math.abs(RaqueteCPUDirY) <= VelocidadeRaquete) // LIMITA A VELOCIDADE E A POSICAO DO CPU
	{
		RaqueteCPU.position.y += RaqueteCPUDirY;
	}
	else
	{
		if (RaqueteCPUDirY > VelocidadeRaquete)
		{
			RaqueteCPU.position.y += VelocidadeRaquete;
		}
		else if (RaqueteCPUDirY < -VelocidadeRaquete)
		{
			RaqueteCPU.position.y -= VelocidadeRaquete;
		}
	}

    if (bola.position.x > 0 && bola.position.x < 150) RaqueteCPU.position.z = bola.position.z;
}

function playerRaqueteMovement() // MOVIMENTOS E CONTROLES DO PLAYER 1
{
	if (Key.isDown(Key.A)) // MOVE A ESQUERDA
	{
		if (RaquetePlayer1.position.y < fieldHeight * 0.45) //LIMITA A POSICAO DA RAQUETE DO PLAYER 1
		{
			RaquetePlayer1DirY = VelocidadeRaquete * 1;
		}
		else
		{
			RaquetePlayer1DirY = 0; // PARA A RAQUETE
		}
	}
	else if (Key.isDown(Key.D)) // MOVE A DIREITA
	{
		if (RaquetePlayer1.position.y > -fieldHeight * 0.45) //LIMITA A POSICAO DA RAQUETE DO PLAYER 1
		{
			RaquetePlayer1DirY = -VelocidadeRaquete * 1;
		}
		else
		{
			RaquetePlayer1DirY = 0;
		}
	}
	else
	{
		RaquetePlayer1DirY = 0; // PARA A RAQUETE
	}

    if (bola.position.x < 0 && bola.position.x > -150) RaquetePlayer1.position.z = bola.position.z;

	RaquetePlayer1.position.y += RaquetePlayer1DirY;
}

function cameraPhysics() // MOVIMENTO DA CAMERA E POSICAO DO PONTO DE LUZ
{
	spotLight.position.x = 0; spotLight.position.y = 400; spotLight.position.y = 0; // POSICAO DO PONTO DE LUZ

    //--------------------------------------- MOVIMENTOS DA CAMERA ------------------------------------------
    // POSICAO
    camera.position.x = 0;
	camera.position.y = -200;
	camera.position.z =  120;

    // ROTACAO
    camera.rotation.x = 45 + 0.01 * Math.PI/180;
	camera.rotation.y = -0.02 * (bola.position.x) * Math.PI/45;
	camera.rotation.z = 0;
    //-------------------------------------------------------------------------------------------------------
}

function RaquetePhysics() // COLISOES COM AS RAQUETES
 {
	if (bola.position.x <= RaquetePlayer1.position.x + RaqueteLargura	&&  bola.position.x >= RaquetePlayer1.position.x)
	{
		if (bola.position.y <= RaquetePlayer1.position.y + RaqueteAltura/2	&&  bola.position.y >= RaquetePlayer1.position.y - RaqueteAltura/2)
		{
			if (bolaDirX < 0)
			{
				bolaDirX = -bolaDirX; bolaDirY -= RaquetePlayer1DirY * 0.7; // MUDA DIRECAO X Y DA BOLA
                audio.play();
			}
		}
	}
	// LOGICA DA COLISAO COM O CPU
	if (bola.position.x <= RaqueteCPU.position.x + RaqueteLargura &&  bola.position.x >= RaqueteCPU.position.x)
	{
		if (bola.position.y <= RaqueteCPU.position.y + RaqueteAltura/2	&&  bola.position.y >= RaqueteCPU.position.y - RaqueteAltura/2)
		{
			if (bolaDirX > 0)
			{
				bolaDirX = -bolaDirX; bolaDirY -= RaqueteCPUDirY * 0.7; // MUDA DIRECAO X Y DA BOLA
                audio.play();
			}
		}
	}
}

function resetbola(loser)// LOGICA DE JOGO
{
	bola.position.x = 0;  bola.position.y = 0;	//POSICIONA A BOLA NO CENTRO DA MESA

	if (loser == 1)	// ENVIA A BOLA PARA QUEM GANHAR A RODADA
	{
		bolaDirX = -1;
	}
	else
	{
		bolaDirX = 1;
	}
	bolaDirY = 1;
}

var bounceTime = 0;

function matchScoreCheck() // VERIFICA O TERMINO DA PARTIDA (NUMERO DE PONTOS MAXIMOS ALCANÇADOS)
{
	if (Pontuacao1 >= maxScore) // PLAYER 1 GANHA
	{
		VelocidadeBola = 0; // PARA A BOLA
		document.getElementById("scores").innerHTML = "VOCE GANHOU !";
		document.getElementById("winnerBoard").innerHTML = "ATUALIZE A PAGINA PARA JOGAR NOVAMENTE";
		bounceTime++;
		RaquetePlayer1.position.z = Math.sin(bounceTime * 0.1) * 10;
	}
	else if (Pontuacao2 >= maxScore) // CPU GANHA
	{
		VelocidadeBola = 0;
		document.getElementById("scores").innerHTML = "CPU GANHOU";
		document.getElementById("winnerBoard").innerHTML = "ATUALIZE A PAGINA PARA JOGAR NOVAMENTE";
		bounceTime++;
		RaqueteCPU.position.z = Math.sin(bounceTime * 0.1) * 10;
	}
}