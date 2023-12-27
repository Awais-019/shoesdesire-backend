import prisma from "../prisma/prisma";

export default {
  checkIfUserExists: (userId: string) => {
    return prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  },
  getConversation: (_id: string, userId: string) => {
    return prisma.conversation.findFirst({
      where: {
        Participant: {
          every: {
            userId: {
              in: [_id, userId],
            },
          },
        },
      },
      include: {
        Participant: {
          where: { userId: { not: _id } },
          select: {
            User: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        Message: {
          select: {
            id: true,
            message: true,
            created_at: true,
            sender: true,
            receiver: true,
          },
          orderBy: {
            created_at: "desc",
          },
          take: 1,
        },
      },
    });
  },
  createConversation: (_id: string, userId: string) => {
    return prisma.conversation.create({
      data: {
        Participant: {
          createMany: {
            data: [
              {
                userId: _id,
              },
              {
                userId: userId,
              },
            ],
          },
        },
      },
      include: {
        Participant: {
          where: { userId: { not: _id } },
          select: {
            User: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  },
  getConversations: async (_id: string) => {
    const conversations = await prisma.conversation.findMany({
      where: {
        Participant: {
          some: {
            userId: _id,
          },
        },
      },
      orderBy: {
        updated_at: "desc",
      },
      select: {
        id: true,
        Participant: {
          where: { userId: { not: _id } },
          select: {
            User: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        Message: {
          select: {
            id: true,
            message: true,
            created_at: true,
            sender: true,
            receiver: true,
          },
          orderBy: {
            created_at: "desc",
          },
          take: 1,
        },
      },
    });
    const _conversations = [];
    for (let index = 0; index < conversations.length; index++) {
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conversations[index]?.id,
          receiver: _id,
          read: false,
        },
      });
      _conversations.push({ ...conversations[index], unreadCount });
    }

    return _conversations;
  },
  createMessage: async ({
    conversationId,
    message,
    sender,
    receiver,
  }: {
    conversationId: string;
    message: string;
    sender: string;
    receiver: string;
  }) => {
    const messages = await prisma.message.create({
      data: {
        conversationId,
        message,
        sender,
        receiver,
      },
    });
    await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        updated_at: new Date(),
      },
    });
    return messages;
  },
  getMessages: (conversationId: string) => {
    return prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        created_at: "asc",
      },
    });
  },
  updateMessages: (conversationId: string, userId: string) => {
    return prisma.message.updateMany({
      where: {
        conversationId,
        receiver: userId,
        read: false,
      },
      data: {
        read: true,
      },
    });
  },
};
