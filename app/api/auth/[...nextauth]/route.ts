  import NextAuth from "next-auth"
  import GoogleProvider from "next-auth/providers/google"
  import { connectToDB } from "@/utils/database"
  import User from "@/models/user"

  export const authOptions = {
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      }),
    ],
    callbacks: {
      async session({ session }: { session: any }) {
        try {
          await connectToDB()
          const sessionUser = await User.findOne({ email: session.user.email })
          if (sessionUser) {
            session.user.id = sessionUser._id.toString()
            session.user.username = sessionUser.username
            session.user.image = sessionUser.image
          }
          return session
        } catch (error) {
          console.error("Error in session callback:", error)
          return session
        }
      },
      async signIn({ profile }: { profile: any }) {
        try {
          await connectToDB()

          // Check if user already exists
          const userExists = await User.findOne({ email: profile.email })

          // If not, create a new user
          if (!userExists) {
            await User.create({
              email: profile.email,
              username: profile.name.replace(" ", "").toLowerCase(),
              image: profile.picture,
            })
          }
          return true
        } catch (error) {
          console.error("Error during sign in:", error)
          return false
        }
      },
    },
    secret: process.env.NEXTAUTH_SECRET,
  }

  const handler = NextAuth(authOptions)

  export { handler as GET, handler as POST }
