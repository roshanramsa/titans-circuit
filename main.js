window.addEventListener("load", () => {

    document.querySelector("body").classList.add("p1-turn");
    document.querySelectorAll("button").forEach(button => {
        button.classList.add("p1-turn");
    })
    

    var pairs = [[1,7], [3,9], [5,11], [8,14], [10,16], [12,18]];
    var circuits = 3;
    var game_box = document.querySelector(".game-box");
    var edges = {};
    var adjacency = {}
    var titan_rem = [4,4];
    var turn = 0;
    var points = [0,0];
    
    
    const movement = new Audio('./assets/move.mp3');
    const bg_music = new Audio('./assets/bg.mp3');
    bg_music.loop = true;
    bg_music.volume = 0.5


    // Player 1 - BLUE
    // Player 2 - RED
    // so turn is the turn of Player turn%2 + 1

    var vertices = Array(6*circuits).fill(0);
    var current_circuit = 3;
    var holding = [0, 0] // holding[0] indicates if there is any position that is currently 'held', i.e, about to be shifted; holding[1] contains the vertex from which titan is about to be moved

    // Generates vertex pairs
    for(i = 1; i<=circuits; i++){
        for( j=6*(i-1) + 1; j<6*i; j++){
            pairs.push([j,j+1]);
        }
        pairs.push([6*i, 6*(i-1) + 1]); 
    }

    // Generates adjacency list and edge object 
    pairs.forEach(([vertex1 , vertex2]) => {
        if (!adjacency[vertex1]) adjacency[vertex1] = [];
        if (!adjacency[vertex2]) adjacency[vertex2] = [];
        adjacency[vertex1].push(vertex2);
        adjacency[vertex2].push(vertex1);

        const index = pairs.findIndex(pair => pair[0] === vertex1 && pair[1] === vertex2);

        const rand_val = (index < 6) ? 1 : 10 - Math.floor(Math.random() * 2 * (Math.floor(Math.min(vertex1, vertex2)/6) + 1) + 1 * (Math.floor(Math.min(vertex1, vertex2)/6) + 1))
        edges[`${Math.min(vertex1, vertex2)} - ${Math.max(vertex1, vertex2)}`] = [0, rand_val]
    })

    // Gets the center pos of given button 
    function getCenter(button){
        var box_dimensions = button.getBoundingClientRect();
        var bounding_box = game_box.getBoundingClientRect();

        return ( {x : box_dimensions.left - bounding_box.left + box_dimensions.width/2, y : box_dimensions.top - bounding_box.top + box_dimensions.height/2} );
    }

    function drawLine(parents, edges, player){
        const button1 = document.getElementById(parents[0]);
        const button2 = document.getElementById(parents[1]);
        const pt1 = getCenter(button1);
        const pt2 = getCenter(button2);
        const edge = `${Math.min(parents[0], parents[1])} - ${Math.max(parents[0], parents[1])}`;

        const thickness = 10 - 1*(Math.floor(parents[0]/6));

        const del_x = pt2.x - pt1.x;
        const del_y = pt2.y - pt1.y;
        const len = Math.sqrt(del_x*del_x + del_y*del_y);
        const angle = Math.atan2(del_y, del_x) * 180/Math.PI;

        const line = document.createElement("div");
        line.classList.add("connector");
        if ( edges[edge][0] != 0) line.classList.add((edges[edge][0] - 1 == 0) ? "p1" : "p2");
        else line.classList.add((player == 1) ? "p1-turn" : "p2-turn");
        line.style.width = `${len}px`;
        line.id = edge;
        line.style.height = `${thickness/10}vh`
        line.style.transform = `rotate(${angle}deg)`
        line.style.left = `${pt1.x}px`;
        line.style.top = `${pt1.y}px`;

        const edge_score = document.createElement("div");
        edge_score.classList.add("edge-score");
        if ( edges[edge][0] != 0) edge_score.classList.add((edges[edge][0] - 1 == 0) ? "p1" : "p2");
        else edge_score.classList.add((player == 1) ? "p1-turn" : "p2-turn");
        edge_score.id = line.id.concat(" score");
        edge_score.textContent = edges[edge][1];
        line.appendChild(edge_score);

        game_box.appendChild(line);
    }

    function drawOutline(){
        document.querySelectorAll(".connector").forEach(line => line.remove());
        pairs.forEach(pair => {
            drawLine(pair, edges, turn%2 + 1);
        })
    }

    function checkFilled(circuit_num){
        for(i = 6*(circuit_num - 1) + 1; i<= 6*circuit_num; i++){
            if (vertices[i - 1] == 0) return 0;
        }
        return 1;
    }

    function adjacencyCheck(vertex1, vertex2){
        var check = false;
        adjacency[vertex1].forEach(vertex => {
            console.log(`${vertex} - ${vertex2}`);
            if (vertex == vertex2) check = true;
        })
        return check;
    }

    drawOutline();
    window.addEventListener("resize", drawOutline);

    document.querySelectorAll(".connector").forEach(connector => {
        connector.classList.add("p1-turn");
    })

    document.querySelectorAll("button").forEach(button => {
        button.addEventListener("click", (e)=>{

            const id = button.id;
            const player = turn%2 + 1;
            const circuit_num = Math.floor((id - 0.1)/6) + 1;
            var valid_turn = 0;

            if (circuit_num < current_circuit){
            }

            // Case 1 : Moving an already placed Titan
            else if (holding[0] == 1 && vertices[id - 1] == 0 && adjacencyCheck(holding[1], id)){ 
                console.log("button " + button.id)
                console.log("holding" + holding[1])
                console.log("check " + adjacencyCheck(holding[1], button.id))
                console.log("list " + adjacency[holding[1]]);
                valid_turn = 1;

                const old_vertex = holding[1]

                vertices[old_vertex - 1] = 0;
                
                holding = [0,0]; // Resets holding - none

                // Removes all connections of vertex that was moved 
                
                document.getElementById(old_vertex).classList.remove((player - 1 == 0) ? "p1" : "p2") // Removes player specific color of previously occupied node

                adjacency[old_vertex].forEach(vertex => {
                    if (vertices[vertex - 1] == player){
                        const edge = `${Math.min(old_vertex, vertex)} - ${Math.max(old_vertex, vertex)}`
                        points[player - 1] -= edges[edge][1];
                        edges[edge][0] = 0;

                        // Removes color of previously occupied edges and text
                        document.getElementById(edge).classList.remove((player - 1 == 0) ? "p1" : "p2")
                        document.getElementById(edge.concat(" score")).classList.remove((player - 1 == 0) ? "p1" : "p2")
                    }
                })

                vertices[id - 1] = player;
                
                // Adds new connections to the newly moved vertex

                button.classList.add((player - 1 == 0) ? "p1" : "p2") // Changes color of newly occupied button

                adjacency[id].forEach(vertex => {
                    if (vertices[vertex - 1] == player){
                        const edge = `${Math.min(id, vertex)} - ${Math.max(id, vertex)}`
                        points[player - 1] += edges[edge][1];
                        edges[edge][0] = player;

                        // Removes the default color 'p1-turn' and adds player specific colors to newly occupied edges and text
                        document.getElementById(edge).classList.remove((player - 1 == 0) ? "p1-turn" : "p2-turn")
                        document.getElementById(edge).classList.add((player - 1 == 0) ? "p1" : "p2")
                        document.getElementById(edge.concat(" score")).classList.remove((player - 1 == 0) ? "p1-turn" : "p2-turn")
                        document.getElementById(edge.concat(" score")).classList.add((player - 1 == 0) ? "p1" : "p2")
                    }
                })
            }

            // Picking up a Titan
            else if(vertices[id - 1] == player){
                holding = [1,id];
            }

            // Case 2: Placing a new titan
            else if (vertices[id - 1] == 0 && titan_rem[player - 1] != 0){ 
                valid_turn = 1;
                vertices[id - 1] = player;
                titan_rem[player - 1]--;

                // Sets player specific color to newly occupied node
                button.classList.add((player - 1 == 0) ? "p1" : "p2") 

                // Removes the default color 'p1-turn' and adds player specific colors to newly occupied edges and text
                adjacency[id].forEach(vertex => {
                    if (vertices[vertex - 1] == player){
                        const edge = `${Math.min(id, vertex)} - ${Math.max(id, vertex)}`
                        points[player - 1] += edges[edge][1];
                        edges[edge][0] = player;
                        document.getElementById(edge).classList.remove((player - 1 == 0) ? "p1-turn" : "p2-turn")
                        document.getElementById(edge).classList.add((player - 1 == 0) ? "p1-line" : "p2-line")
                        document.getElementById(edge.concat(" score")).classList.remove((player - 1 == 0) ? "p1-turn" : "p2-turn")
                        document.getElementById(edge.concat(" score")).classList.add((player - 1 == 0) ? "p1" : "p2")
                    }
                })
            }

            // Do this if the turn was valid
            if (valid_turn){

                if(turn == 0){
                    bg_music.play();
                }

                movement.play();

                turn++;

                // Switches color of body as per turn
                document.querySelector("body").classList.remove((player == 1) ? "p1-turn" : "p2-turn")
                document.querySelector("body").classList.add((player == 2) ? "p1-turn" : "p2-turn")

                // Changes color of all non occupied buttons
                document.querySelectorAll("button").forEach(button => {
                    if (1) {
                        button.classList.remove((player == 1) ? "p1-turn" : "p2-turn");
                        button.classList.add((player == 2) ? "p1-turn" : "p2-turn");
                    }
                });
                
                document.querySelectorAll(".connector").forEach(line => {
                    const edge = line.id
                    const score = edge.concat(" score");
                    const edge_score = document.getElementById(score);
                    if ( edges[edge][0] != 0){
                        line.classList.add((edges[edge][0] - 1 == 0) ? "p1" : "p2");
                        edge_score.classList.add((edges[edge][0] - 1 == 0) ? "p1-text" : "p2-text");
                    }
                    else{ 
                        line.classList.remove((player == 1) ? "p1-turn" : "p2-turn");
                        line.classList.add((player == 2) ? "p1-turn" : "p2-turn");
                        edge_score.classList.remove((player == 1) ? "p1-turn" : "p2-turn");
                        edge_score.classList.add((player == 2) ? "p1-turn" : "p2-turn");
                        
                    }
                })

                // Checks if current circuit is filled and unlocks the next circuit accordingly
                if(checkFilled(current_circuit)){
                    current_circuit--;
                    if (current_circuit == 0) alert()
                }

                var time = 30;
                const timer = setInterval( ()=>{
                    time--
                    if(time==0) return;
                } , 1000 )
            }

        })
    }) 
})