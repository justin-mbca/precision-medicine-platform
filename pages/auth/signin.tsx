import type { GetServerSideProps } from "next";
import { getCsrfToken, signIn } from "next-auth/react";

interface Props {
  csrfToken: string | undefined;
}

export default function SignIn({ csrfToken }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-2xl font-semibold mb-2 text-slate-900">
          Precision Medicine Console
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Sign in with your clinical account (mock).
        </p>

        <form
          className="space-y-4"
          method="post"
          onSubmit={(e) => {
            // NextAuth will handle the form submission via signIn call below.
            e.preventDefault();
          }}
        >
          <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              name="email"
              type="email"
              defaultValue="clinician@example.com"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              name="password"
              type="password"
              defaultValue="password123"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            onClick={async (e) => {
              e.preventDefault();
              const form = e.currentTarget.form;
              if (!form) return;
              const formData = new FormData(form);
              await signIn("credentials", {
                email: formData.get("email"),
                password: formData.get("password"),
                callbackUrl: "/"
              });
            }}
            className="w-full rounded-md bg-brand-600 py-2 text-sm font-semibold text-white shadow hover:bg-brand-500"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const csrfToken = await getCsrfToken(context);
  return {
    props: {
      csrfToken
    }
  };
};

