/** @type HTMLCanvasElement */
const canvas = document.querySelector('#board')
/** @type CanvasRenderingContext2D */
const context = canvas.getContext('2d')
const squareSize = 200

canvas.width = 600
canvas.height = 600

function drawBoardSquare(x, y) {
	context.fillStyle = 'black'
	context.fillRect(x, y, squareSize, squareSize)
	context.fillStyle = 'white'
	context.fillRect(x + 1, y + 1, squareSize - 1, squareSize - 1)
}

function drawBoard() {
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			const cords = {
				x: i * squareSize,
				y: j * squareSize,
			}

			drawBoardSquare(cords.x, cords.y)
		}
	}
}

const getCellOrRow = position => {
	if (position <= squareSize) return 0
	if (position <= squareSize * 2) return 1
	return 2
}


function drawCross(x, y) {
	context.beginPath()

	const cords = {
		startX: x + (squareSize * 0.2),
		startY: y + (squareSize * 0.2),
		endX: x + (squareSize * 0.8),
		endY: y + (squareSize * 0.8)
	}

	context.moveTo(cords.startX, cords.startY)
	context.lineTo(cords.endX, cords.endY)

	context.moveTo(cords.endX, cords.startY)
	context.lineTo(cords.startX, cords.endY)

	context.stroke()
	context.closePath()
}

function drawCircle(x, y) {
	context.beginPath()
	const cords = {
		x: (squareSize / 2) + x,
		y: (squareSize / 2) + y,
		size: squareSize * 0.3
	}
	context.arc(cords.x, cords.y, cords.size, 0, 2 * Math.PI)
	context.stroke()
	context.closePath()
}

function clearBoard() {
	context.clearRect(0, 0, canvas.width, canvas.height)
}

function checkVictory(positions) {
	const winCases = [
		['0:0', '0:1', '0:2'], // first row straight
		['1:0', '1:1', '1:2'], // second row straight
		['2:0', '2:1', '2:2'], // third row straight
		['0:0', '1:1', '2:2'], // from top left to bottom right
		['0:2', '1:1', '2:0'], // from top right to bottom left
		['0:0', '1:0', '2:0'], // first column straight
		['0:1', '1:1', '2:1'], // second column straight
		['0:2', '1:2', '2:2'] // third line straight
	]

	let winner = null

	winCases.forEach((row, rowIndex) => {
		const winCords = row.map(column => column.split(':').map(Number))
		const xWin = winCords.every(([x, y]) => positions[x][y] === 'x')
		const oWin = winCords.every(([x, y]) => positions[x][y] === 'o')

		if (xWin) winner = 'x'
		if (oWin) winner = 'o'
	})

	return winner
}

function drawStartText() {
	context.font = '20px arial'
	context.fillStyle = 'black'
	context.textAlign = 'center'
	context.fillText('Clique aqui para reiniciar', canvas.width / 2, canvas.height / 2)
}

function startGame() {
	clearBoard()
	const positions = JSON.parse(JSON.stringify(Array(3).fill(Array(3).fill(null))))
	let playerTurn = 0
	let plays = 0

	drawBoard()

	/** @type MouseEvent */
	let listener = ev => {
		const row = getCellOrRow(ev.layerY)
		const column = getCellOrRow(ev.layerX)

		console.log(positions)

		if (positions[row][column] !== null) return

		plays++

		if (plays === 9) {
			terminateGame('Empate! jogar novamente?')
		}

		function terminateGame(message) {
			setTimeout(() => {
				if (confirm(message)) {
					endGame()
					startGame()
				} else {
					clearBoard()
					endGame()
					drawStartText()
					let restartListener = () => {
						startGame()
						canvas.removeEventListener('click', restartListener)
					}

					canvas.addEventListener('click', restartListener)
				}
			}, 200)
		}

		const y = row * squareSize
		const x = column * squareSize

		if (!playerTurn) {
			playerTurn = 1
			positions[row][column] = 'x'
			drawCross(x, y)
		} else {
			playerTurn = 0
			positions[row][column] = 'o'
			drawCircle(x, y)
		}

		if (plays > 3) {
			const winner = checkVictory(positions)

			if (winner) {
				terminateGame(`${winner} venceu! jogar novamente?`)
			}
		}
	};

	function endGame() {
		canvas.removeEventListener('click', listener)
	}

	canvas.addEventListener('click', listener)
}

startGame()

