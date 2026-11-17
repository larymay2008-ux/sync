import { useEffect, useMemo, useRef, useState } from 'react'

const pictures = [
  { src: '/cards/winx-1.jpg', label: 'Stormy' },
  { src: '/cards/winx-2.jpg', label: 'Icy' },
  { src: '/cards/winx-3.jpg', label: 'Darcy' },
  { src: '/cards/winx-4.jpg', label: 'Roxy' },
  { src: '/cards/winx-5.jpg', label: 'Stella' },
  { src: '/cards/winx-6.jpg', label: 'Musa' },
  { src: '/cards/winx-7.jpg', label: 'Flora' },
  { src: '/cards/winx-8.jpg', label: 'Bloom' },
]

type Card = (typeof pictures)[number] & { id: string; matched: boolean }

function createDeck(): Card[] {
  const cards = pictures.flatMap((picture, pair) => [
    { ...picture, id: `${pair}-a`, matched: false },
    { ...picture, id: `${pair}-b`, matched: false },
  ])

  for (let index = cards.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[cards[index], cards[randomIndex]] = [cards[randomIndex], cards[index]]
  }

  return cards
}

export default function App() {
  const [deck, setDeck] = useState(createDeck)
  const [openCards, setOpenCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [locked, setLocked] = useState(false)
  const timerRef = useRef<number | null>(null)
  const pairs = useMemo(() => deck.filter((card) => card.matched).length / 2, [deck])

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    },
    [],
  )

  function reveal(index: number) {
    if (locked || openCards.includes(index) || deck[index].matched) return

    if (openCards.length === 0) {
      setOpenCards([index])
      return
    }

    const first = openCards[0]
    const matched = deck[first].src === deck[index].src
    setOpenCards([first, index])
    setMoves((value) => value + 1)
    setLocked(true)

    timerRef.current = window.setTimeout(
      () => {
        if (matched) {
          setDeck((cards) =>
            cards.map((card, cardIndex) =>
              cardIndex === first || cardIndex === index ? { ...card, matched: true } : card,
            ),
          )
        }
        setOpenCards([])
        setLocked(false)
        timerRef.current = null
      },
      matched ? 400 : 800,
    )
  }

  function restart() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setDeck(createDeck())
    setOpenCards([])
    setMoves(0)
    setLocked(false)
  }

  return (
    <main className="page-shell">
      <section className="game" aria-label="Jogo da memória">
        <header className="game-header">
          <div>
            <p className="eyebrow">Winx Club • Encontre os 8 pares</p>
            <h1>Jogo da memória</h1>
          </div>
          <button className="restart" onClick={restart} aria-label="Começar novamente">
            ↻
          </button>
        </header>

        <div className="score-row" aria-live="polite">
          <span>
            Pares <strong>{pairs}/8</strong>
          </span>
          <span>
            Jogadas <strong>{moves}</strong>
          </span>
        </div>

        <div className="board">
          {deck.map((card, index) => {
            const visible = card.matched || openCards.includes(index)
            return (
              <button
                className={`card ${visible ? 'is-visible' : ''} ${card.matched ? 'is-matched' : ''}`}
                key={card.id}
                onClick={() => reveal(index)}
                aria-label={visible ? card.label : 'Carta escondida'}
                aria-pressed={visible}
              >
                <span className="card-back" aria-hidden="true">
                  ?
                </span>
                <span className="card-front" aria-hidden="true">
                  <img src={card.src} width="512" height="512" alt="" draggable="false" />
                </span>
              </button>
            )
          })}
        </div>

        {pairs === pictures.length && (
          <div className="message" role="status">
            <span>Parabéns! Você conseguiu!</span>
            <button onClick={restart}>Jogar novamente</button>
          </div>
        )}
      </section>
    </main>
  )
}
