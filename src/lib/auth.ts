import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Email inválido" }),
  password: z.string().min(6, { message: "Contraseña debe tener al menos 6 caracteres" }),
});

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log('🔐 NextAuth: authorize called');
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ NextAuth: Missing credentials');
          return null;
        }

        const validatedFields = loginSchema.safeParse(credentials);

        if (!validatedFields.success) {
          console.log('❌ NextAuth: Validation failed');
          return null;
        }

        const { email, password } = validatedFields.data;

        try {
          const result = await sql`
            SELECT id, email, password_hash, role 
            FROM users 
            WHERE email = ${email}
          `;

          const user = result[0] as any;

          if (!user) {
            console.log('❌ NextAuth: User not found');
            return null;
          }

          const passwordMatch = await bcrypt.compare(password, user.password_hash);

          if (!passwordMatch) {
            console.log('❌ NextAuth: Password mismatch');
            return null;
          }

          // Solo permitir administradores
          if (user.role !== 'admin') {
            console.log('❌ NextAuth: User is not admin');
            return null;
          }

          console.log('✅ NextAuth: User authorized:', user.email);
          return {
            id: user.id,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error('❌ NextAuth: Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Si la URL es relativa, permitir la redirección
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Si la URL pertenece al mismo dominio, permitirla
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 15 * 60, // 15 minutos (900 segundos) - expira sin renovación
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.battleboost.pro' : undefined,
      },
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
