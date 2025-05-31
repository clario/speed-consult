import { SvelteKitAuth } from "@auth/sveltekit"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/prisma"
 
export const { handle, signIn, signOut } = SvelteKitAuth({
  adapter: PrismaAdapter(prisma),
  providers: [],
})