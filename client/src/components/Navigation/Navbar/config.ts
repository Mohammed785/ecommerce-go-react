export const mainNav = [
    {
        to: "/",
        title: "Home",
        end: true,
    },
    {
        to: "/products",
        title: "Products",
    },
];

export const adminMenu = [
    {
        title: "Products",
        to: "/dashboard/products",
        subs: [
            {
                to: "/dashboard/product/new",
                title: "Add Product",
            },
            {
                to: "/dashboard/attributes",
                title: "Products Attributes",
            },
            {
                to: "/dashboard/categories",
                title: "Products Categories",
            },
        ],
    },
];