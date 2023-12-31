import prisma from "../prisma/prisma";

export default {
  create: async (
    product: {
      name: string;
      slug: string;
      description: string;
      price: number;
      stock: number;
    },
    categories: string[],
    sizes: string[],
    colors: string[],
    images: string[]
  ) => {
    return await prisma.$transaction(async () => {
      const newProduct = await prisma.product.create({
        data: {
          ...product,
        },
      });
      await prisma.productCategory.createMany({
        data: categories.map((categoryId) => {
          return {
            productId: newProduct.id,
            categoryId,
          };
        }),
      });
      await prisma.productSize.createMany({
        data: sizes.map((sizeId) => {
          return {
            productId: newProduct.id,
            sizeId,
          };
        }),
      });
      await prisma.productColor.createMany({
        data: colors.map((colorId) => {
          return {
            productId: newProduct.id,
            colorId,
          };
        }),
      });
      await prisma.productImage.createMany({
        data: images.map((url) => {
          return {
            url: `${process.env.BASE_URL}/images/${url}`,
            productId: newProduct.id,
          };
        }),
      });
      return newProduct;
    });
  },
  getAll: (category?: string, size?: string, color?: string, q?: string) => {
    const filter = {} as any;
    const query = q?.toLowerCase();

    if (query) {
      filter.OR = [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          slug: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          ProductCategory: {
            some: {
              Category: {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            },
          },
        },
        {
          ProductColor: {
            some: {
              Color: {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            },
          },
        },
      ];
    }

    if (category) {
      filter.ProductCategory = {
        some: {
          Category: {
            name: category,
          },
        },
      };
    }
    if (size) {
      filter.ProductSize = {
        some: {
          Size: {
            size: parseInt(size),
          },
        },
      };
    }
    if (color) {
      filter.ProductColor = {
        some: {
          Color: {
            name: color,
          },
        },
      };
    }

    return prisma.product.findMany({
      where: filter,
      orderBy: {
        createdAt: "desc",
      },
      skip: 0,
      take: 10,
      include: {
        Images: {
          select: {
            url: true,
          },
        },
        ProductCategory: true,
        ProductColor: true,
        ProductSize: true,
      },
    });
  },
  getByCategory: (categoryId: string) => {
    return prisma.product.findMany({
      where: {
        ProductCategory: {
          some: {
            categoryId,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        Images: true,
        ProductColor: {
          select: {
            Color: {
              select: {
                name: true,
                hex: true,
              },
            },
          },
        },
        ProductSize: {
          select: {
            Size: {
              select: {
                size: true,
              },
            },
          },
        },
      },
    });
  },
  getById: (id: string) => {
    return prisma.product.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        Images: {
          select: {
            id: true,
            url: true,
          },
        },
        ProductSize: {
          select: {
            Size: {
              select: {
                id: true,
                size: true,
              },
            },
          },
        },
        ProductColor: {
          select: {
            Color: {
              select: {
                id: true,
                name: true,
                hex: true,
              },
            },
          },
        },
      },
    });
  },
};
