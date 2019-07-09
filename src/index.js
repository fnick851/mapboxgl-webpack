import "./mapbox-gl.css"
import mapboxgl from "mapbox-gl"

mapboxgl.accessToken =
    "pk.eyJ1IjoibWFsLXdvb2QiLCJhIjoiY2oyZ2t2em50MDAyMzJ3cnltMDFhb2NzdiJ9.X-D4Wvo5E5QxeP7K_I3O8w"

var map = new mapboxgl.Map({
    container: "map",
    zoom: 3,
    center: [7.5, 58],
    style: "mapbox://styles/mapbox/light-v10"
})

var highlightLayer = {
    id: "highlight",
    type: "custom",
    source: "esri",

    onAdd: function(map, gl) {
        var vertexSource = `
            uniform mat4 u_matrix;
            attribute vec2 a_pos;
            void main() {
                gl_Position = u_matrix * vec4(a_pos, 0.0, 1.0);
            }
        `
        var fragmentSource = `
            precision mediump float;
 
            uniform vec4 u_color;
            
            void main() {
                gl_FragColor = u_color;
            }
        `
        var vertexShader = gl.createShader(gl.VERTEX_SHADER)
        gl.shaderSource(vertexShader, vertexSource)
        gl.compileShader(vertexShader)
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
        gl.shaderSource(fragmentShader, fragmentSource)
        gl.compileShader(fragmentShader)

        this.cgProgram = gl.createProgram()
        gl.attachShader(this.cgProgram, vertexShader)
        gl.attachShader(this.cgProgram, fragmentShader)
        gl.linkProgram(this.cgProgram)

        this.vertexPosition = gl.getAttribLocation(this.cgProgram, "a_pos")
        this.colorUniformLocation = gl.getUniformLocation(
            this.cgProgram,
            "u_color"
        )

        var helsinki = mapboxgl.MercatorCoordinate.fromLngLat({
            lng: 25,
            lat: 60
        })
        console.log(helsinki)
        var berlin = mapboxgl.MercatorCoordinate.fromLngLat({
            lng: 14,
            lat: 52
        })
        console.log(berlin)
        var kyiv = mapboxgl.MercatorCoordinate.fromLngLat({
            lng: 31,
            lat: 40
        })
        console.log(kyiv)
        this.buffer = gl.createBuffer()

        // var source = map.style.sourceCaches["esri"]
        // console.log(source)
        // var coords = source.getVisibleCoordinates().reverse()
        // console.log(coords)
        // for (var coord of coords) {
        //     var tile = source.getTile(coord)
        //     var xyz = tile.tileID.canonical
        //     console.log(xyz)
        // }
    },

    render: function(gl, matrix) {
        gl.useProgram(this.cgProgram)
        gl.uniformMatrix4fv(
            gl.getUniformLocation(this.cgProgram, "u_matrix"),
            false,
            matrix
        )
        gl.uniform4f(
            this.colorUniformLocation,
            Math.random(),
            Math.random(),
            Math.random(),
            1
        )
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
                Math.random(),
                Math.random(),
                Math.random(),
                Math.random(),
                Math.random(),
                Math.random()
            ]),
            // new Float32Array([
            //     helsinki.x,
            //     helsinki.y,
            //     berlin.x,
            //     berlin.y,
            //     kyiv.x,
            //     kyiv.y
            // ]),
            gl.STATIC_DRAW
        )
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
        gl.enableVertexAttribArray(this.vertexPosition)
        gl.vertexAttribPointer(this.vertexPosition, 2, gl.FLOAT, false, 0, 0)
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
        gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
}

map.on("load", function() {
    map.addSource("esri", {
        type: "raster",
        tiles: [
            "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        ],
        tileSize: 256
    })
    map.addLayer({
        id: "esri",
        type: "raster",
        paint: {
            "raster-opacity": 0.5
        },
        source: "esri"
    })
    var source = map.style.sourceCaches["esri"]
    console.log(source)
    var coords = source.getVisibleCoordinates().reverse()
    console.log(coords)
    for (var coord of coords) {
        var tile = source.getTile(coord)
        var xyz = tile.tileID.canonical
        console.log(xyz)
    }
    // map.addLayer(highlightLayer)
})
