import { useEffect, useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { decodePairs } from '@/lib/draw'
import { clearPerson, loadPerson, savePerson } from '@/lib/storage'
import { PAIRS_B64 } from '@/pairs.generated'
import { PARTICIPANTS, PRICE_LIMIT } from '@/participants'

const pairs = decodePairs(PAIRS_B64)

// choose → confirm → reveal; "welcome" é a tela inicial de quem já se identificou antes.
type Screen =
  | { name: 'welcome'; person: string }
  | { name: 'choose' }
  | { name: 'confirm'; person: string }
  | { name: 'reveal'; person: string }

function initialScreen(): Screen {
  const person = loadPerson()
  return person ? { name: 'welcome', person } : { name: 'choose' }
}

export default function App() {
  const [screen, setScreen] = useState<Screen>(initialScreen)
  const [remembered, setRemembered] = useState(loadPerson)

  // Cada tela nova começa do topo (exceto ao abrir/fechar a confirmação por cima da lista).
  const listVisible = screen.name === 'choose' || screen.name === 'confirm'
  const view = listVisible ? 'list' : screen.name
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [view])

  const goHome = () => setScreen(remembered ? { name: 'welcome', person: remembered } : { name: 'choose' })

  const confirm = (person: string) => {
    savePerson(person)
    setRemembered(person)
    setScreen({ name: 'reveal', person })
  }

  const forget = () => {
    clearPerson()
    setRemembered(null)
    setScreen({ name: 'choose' })
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-5 py-8">
      {screen.name === 'welcome' && (
        <WelcomeScreen
          person={screen.person}
          onReveal={() => setScreen({ name: 'reveal', person: screen.person })}
          onChooseOther={() => setScreen({ name: 'choose' })}
          onForget={forget}
        />
      )}

      {listVisible && (
        <ChooseScreen
          onPick={(person) => setScreen({ name: 'confirm', person })}
          onBack={remembered ? goHome : undefined}
        />
      )}

      {screen.name === 'reveal' && (
        <RevealScreen key={screen.person} person={screen.person} drawn={pairs[screen.person]} onDone={goHome} />
      )}

      <ConfirmDialog
        person={screen.name === 'confirm' ? screen.person : null}
        onConfirm={confirm}
        onCancel={() => setScreen((s) => (s.name === 'confirm' ? { name: 'choose' } : s))}
      />
    </main>
  )
}

function Title() {
  return <h1 className="text-[1.75rem] leading-tight font-bold text-primary">Amigo Secreto da Família 🎁</h1>
}

function PriceCard() {
  return (
    <Card className="flex-row items-center gap-3 border-secondary-foreground/20 bg-secondary px-5 py-4 text-secondary-foreground shadow-none">
      <span aria-hidden className="text-2xl">
        🎄
      </span>
      <p className="text-lg">
        Valor do presente: <strong className="font-semibold">{PRICE_LIMIT}</strong>
      </p>
    </Card>
  )
}

function ChooseScreen({ onPick, onBack }: { onPick: (person: string) => void; onBack?: () => void }) {
  return (
    <>
      <header className="flex flex-col gap-4">
        {onBack && (
          <Button variant="link" className="h-auto self-start p-0 text-lg" onClick={onBack}>
            ← Voltar
          </Button>
        )}
        <Title />
        <p className="text-lg leading-relaxed">
          Toque no seu nome na lista abaixo para descobrir quem você tirou. Cada pessoa só deve ver o próprio amigo
          secreto.
        </p>
        <PriceCard />
      </header>

      <section aria-labelledby="lista-nomes" className="flex flex-col gap-3">
        <h2 id="lista-nomes" className="text-xl font-semibold">
          Qual é o seu nome?
        </h2>
        <ul className="flex flex-col gap-3">
          {PARTICIPANTS.map((person) => (
            <li key={person}>
              <Button
                variant="outline"
                size="xl"
                className="min-h-16 justify-start border-2 bg-card text-left font-medium shadow-sm hover:border-primary/40 hover:bg-accent"
                onClick={() => onPick(person)}
              >
                {person}
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

function ConfirmDialog({
  person,
  onConfirm,
  onCancel,
}: {
  person: string | null
  onConfirm: (person: string) => void
  onCancel: () => void
}) {
  // Mantém o último nome durante a animação de fechamento.
  const [shown, setShown] = useState(person)
  if (person && person !== shown) setShown(person)

  return (
    <AlertDialog open={person !== null} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="max-w-[calc(100%-2rem)] gap-6 rounded-2xl p-6 sm:max-w-md">
        <AlertDialogHeader className="place-items-start text-left">
          <AlertDialogTitle className="text-[1.75rem] leading-tight font-bold">
            Você é <span className="text-primary">{shown}</span>?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-lg leading-relaxed text-foreground">
            Se você confirmar, vai ver quem <strong>{shown}</strong> tirou. Só confirme se esse for o seu nome.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-3 sm:flex-col">
          <AlertDialogAction size="xl" onClick={() => shown && onConfirm(shown)}>
            Sim, sou eu
          </AlertDialogAction>
          <AlertDialogCancel size="xl" className="border-2">
            Não, voltar
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function WelcomeScreen({
  person,
  onReveal,
  onChooseOther,
  onForget,
}: {
  person: string
  onReveal: () => void
  onChooseOther: () => void
  onForget: () => void
}) {
  return (
    <>
      <Title />
      <section className="flex flex-col gap-4">
        <h2 className="text-[1.75rem] leading-tight font-semibold">Olá, {person}! 👋</h2>
        <p className="text-lg leading-relaxed">Toque no botão abaixo para ver de novo quem você tirou.</p>
      </section>
      <div className="flex flex-col gap-3">
        <Button size="xl" onClick={onReveal}>
          Ver meu amigo secreto
        </Button>
        <Button variant="outline" size="xl" className="border-2 bg-card" onClick={onChooseOther}>
          Ver o amigo secreto de outra pessoa
        </Button>
      </div>
      <PriceCard />
      <Button variant="link" className="h-auto self-center p-2 text-lg text-muted-foreground underline" onClick={onForget}>
        Não sou {person}
      </Button>
    </>
  )
}

function RevealScreen({ person, drawn, onDone }: { person: string; drawn: string; onDone: () => void }) {
  const [revealed, setRevealed] = useState(false)

  return (
    <>
      <Title />
      <p className="text-xl leading-relaxed">
        <strong>{person}</strong>, o seu amigo secreto é:
      </p>

      {revealed ? (
        <Card
          role="status"
          className="items-center border-2 border-primary/30 px-6 py-10 text-center shadow-md motion-safe:animate-in motion-safe:duration-300 motion-safe:fade-in motion-safe:zoom-in-95"
        >
          <span aria-hidden className="text-5xl">
            🎁
          </span>
          <p className="text-[2.25rem] leading-tight font-bold break-words text-primary">{drawn}</p>
        </Card>
      ) : (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-primary/50 bg-accent px-6 py-10 text-center text-accent-foreground shadow-sm transition-colors outline-none hover:bg-accent/70 focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <span aria-hidden className="text-5xl">
            🎁
          </span>
          <span className="text-2xl font-semibold">Toque para revelar</span>
          <span className="text-base text-muted-foreground">Confira se ninguém está olhando a sua tela.</span>
        </button>
      )}

      <p className="text-center text-xl font-semibold">Não conte para ninguém! 🤫</p>
      <PriceCard />
      <Button size="xl" onClick={onDone}>
        Entendi
      </Button>
    </>
  )
}
