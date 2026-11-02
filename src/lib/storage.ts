import { PARTICIPANTS } from '@/participants'

const KEY = 'amigo-secreto:pessoa'

// localStorage pode falhar (modo privado, armazenamento bloqueado); nesse caso só não lembramos.
export function loadPerson(): string | null {
  try {
    const name = localStorage.getItem(KEY)
    return name && (PARTICIPANTS as readonly string[]).includes(name) ? name : null
  } catch {
    return null
  }
}

export function savePerson(name: string) {
  try {
    localStorage.setItem(KEY, name)
  } catch {
    // ignora
  }
}

export function clearPerson() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignora
  }
}
