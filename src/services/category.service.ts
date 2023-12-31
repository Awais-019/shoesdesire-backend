import { Category } from "@prisma/client";
import prisma from "../prisma/prisma";

export default {
  create: (category: Category, imageName: string) => {
    return prisma.$transaction(async function () {
      const c = await prisma.category.create({
        data: {
          ...category,
          slug: category.name.toLowerCase().replace(" ", "-"),
        },
      });

      await prisma.categoryImage.create({
        data: {
          url: `${process.env.BASE_URL}/images/${imageName}`,
          categoryId: c.id,
        },
      });

      return c;
    });
  },

  updateImage: (categoryId: string, imageName: string) => {
    return prisma.categoryImage.update({
      where: {
        categoryId,
      },
      data: {
        url: `${process.env.BASE_URL}/images/${imageName}`,
      },
    });
  },
  getAll: () => {
    return prisma.category.findMany({
      // skip: 0,
      // take: 10,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        CategoryImage: {
          select: {
            url: true,
          },
        },
        ProductCategory: {
          select: {
            productId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },
  getMenCategories: async () => {
    const products = await prisma.productCategory.findMany({
      where: {
        Category: {
          slug: {
            equals: "men's",
          },
        },
      },
      select: {
        productId: true,
      },
    });

    return prisma.category.findMany({
      where: {
        ProductCategory: {
          some: {
            productId: {
              in: products.map((p) => p.productId),
            },
          },
        },
      },
      include: {
        CategoryImage: {
          select: {
            url: true,
          },
        },
      },
    });
  },
  getWomenCategories: async () => {
    const products = await prisma.productCategory.findMany({
      where: {
        Category: {
          slug: {
            equals: "women's",
          },
        },
      },
      select: {
        productId: true,
      },
    });

    return prisma.category.findMany({
      where: {
        ProductCategory: {
          some: {
            productId: {
              in: products.map((p) => p.productId),
            },
          },
        },
      },
      include: {
        CategoryImage: {
          select: {
            url: true,
          },
        },
      },
    });
  },
};
