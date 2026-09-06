import { login } from "./actions";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4">
      <form
        action={login}
        className="flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-neutral-900 p-8"
      >
        <h1 className="text-xl font-semibold text-white">Enter passcode</h1>
        <input
          type="password"
          name="passcode"
          placeholder="Passcode"
          autoFocus
          className="rounded-xl bg-neutral-800 px-4 py-3 text-white outline-none"
        />
        <button
          type="submit"
          className="rounded-xl bg-white py-3 font-medium text-black"
        >
          Unlock
        </button>
      </form>
    </main>
  );
}