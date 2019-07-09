import "./mapbox-gl.css"
import mapboxgl from "mapbox-gl"

mapboxgl.accessToken =
    "pk.eyJ1IjoibWFsLXdvb2QiLCJhIjoiY2oyZ2t2em50MDAyMzJ3cnltMDFhb2NzdiJ9.X-D4Wvo5E5QxeP7K_I3O8w"

var map = new mapboxgl.Map({
    container: "map",
    zoom: 3,
    center: [7.5, 58],
    style: "mapbox://styles/mapbox/streets-v11"
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

        var helsinki = mapboxgl.MercatorCoordinate.fromLngLat({
            lng: 25,
            lat: 60
        })
        // console.log(helsinki)
        var berlin = mapboxgl.MercatorCoordinate.fromLngLat({
            lng: 14,
            lat: 52
        })
        // console.log(berlin)
        var kyiv = mapboxgl.MercatorCoordinate.fromLngLat({
            lng: 31,
            lat: 40
        })
        // console.log(kyiv)
        this.buffer = gl.createBuffer()
    },

    render: function(gl, matrix) {
        gl.useProgram(this.cgProgram)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)

        gl.uniformMatrix4fv(
            gl.getUniformLocation(this.cgProgram, "u_matrix"),
            false,
            matrix
        )

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
        gl.enableVertexAttribArray(this.vertexPosition)
        gl.vertexAttribPointer(this.vertexPosition, 2, gl.FLOAT, false, 0, 0)
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

        var source = map.style.sourceCaches["esri"]
        // console.log(source)
        var coords = source.getVisibleCoordinates().reverse()
        // console.log(coords)
        var recX = 0
        var recY = 0
        for (var i = 0; i < 220; i++) {
            setRectangle(gl, recX, recY, 0.1, 0.1)
            if (recX <= 2) {
                recX += 0.1
                console.log(recX)
            } else {
                recX = 0
                if (recY <= 4) {
                    recY += 0.1
                } else {
                    recY = 0
                }
            }

            gl.uniform4f(
                gl.getUniformLocation(this.cgProgram, "u_color"),
                Math.random(),
                Math.random(),
                Math.random(),
                1
            )

            gl.drawArrays(gl.TRIANGLES, 0, 6)
        }
        // for (var coord of coords) {
        //     var tile = source.getTile(coord)
        //     var xyz = tile.tileID.canonical
        //     console.log(xyz)

        //     setRectangle(gl, recX, recY, 0.2, 0.2)
        //     if (recX <= 1) {
        //         recX += 0.2
        //     } else {
        //         recX = 0
        //         if (recY <= 1) {
        //             recY += 0.2
        //         } else {
        //             recY = 0
        //         }
        //     }

        //     gl.uniform4f(
        //         gl.getUniformLocation(this.cgProgram, "u_color"),
        //         Math.random(),
        //         Math.random(),
        //         Math.random(),
        //         1
        //     )

        //     gl.drawArrays(gl.TRIANGLES, 0, 6)
        // }

        // Fills the buffer with the values that define a rectangle.
        function setRectangle(gl, x, y, width, height) {
            var x1 = x
            var x2 = x + width
            var y1 = y
            var y2 = y + height

            // NOTE: gl.bufferData(gl.ARRAY_BUFFER, ...) will affect
            // whatever buffer is bound to the `ARRAY_BUFFER` bind point
            // but so far we only have one buffer. If we had more than one
            // buffer we'd want to bind that buffer to `ARRAY_BUFFER` first.

            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array([
                    x1,
                    y1,
                    x2,
                    y1,
                    x1,
                    y2,
                    x1,
                    y2,
                    x2,
                    y1,
                    x2,
                    y2
                ]),
                gl.STATIC_DRAW
            )
        }

        // gl.bufferData(
        //     gl.ARRAY_BUFFER,
        //     new Float32Array([
        //         Math.random(),
        //         Math.random(),
        //         Math.random(),
        //         Math.random(),
        //         Math.random(),
        //         Math.random()
        //     ]),
        //     // new Float32Array([
        //     //     helsinki.x,
        //     //     helsinki.y,
        //     //     berlin.x,
        //     //     berlin.y,
        //     //     kyiv.x,
        //     //     kyiv.y
        //     // ]),
        //     gl.STATIC_DRAW
        // )
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
    map.addLayer(highlightLayer)
})
