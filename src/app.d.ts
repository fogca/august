// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// No Cloudflare bindings (KV/D1/R2) are used, so Platform is left empty.
		// If bindings are added later, declare them under Platform['env'].
		// interface Platform {}
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
	}
}

export {};
