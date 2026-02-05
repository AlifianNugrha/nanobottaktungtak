
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const userId = 'user-123'

    // 1. Ensure User Exists
    const existingUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!existingUser) {
        await prisma.user.create({
            data: {
                id: userId,
                email: 'demo@nexora.ai',
                name: 'Demo Admin',
                role: 'ADMIN',
            },
        })
        console.log('✅ Dummy user created/verified: user-123')
    }

    // 2. Seed Agents
    const agents = [
        {
            name: 'Nexora Sales Pro',
            role: 'Sales Specialist',
            description: 'Expert in closing deals and handling inquiries.',
            avatar: 'sales',
        },
        {
            name: 'Technical Support',
            role: 'Support Engineer',
            description: 'Troubleshoots technical issues and bugs.',
            avatar: 'support',
        },
        {
            name: 'Customer Assistant',
            role: 'General Assistant',
            description: 'Friendly assistant for general questions.',
            avatar: 'assistant',
        }
    ]

    for (const agent of agents) {
        // Check if agent exists for this user to avoid duplicates on re-run
        const existing = await prisma.agent.findFirst({
            where: {
                userId: userId,
                name: agent.name
            }
        })

        if (!existing) {
            await prisma.agent.create({
                data: {
                    ...agent,
                    userId: userId,
                    config: { model: 'gpt-4', temperature: 0.7 }
                }
            })
            console.log(`✅ Agent created: ${agent.name}`)
        } else {
            console.log(`ℹ️ Agent already exists: ${agent.name}`)
        }
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
