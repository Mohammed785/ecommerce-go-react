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
    {
        to: "/dashboard",
        title: "Dashboard",
        admin: true,
    },
];

export const sideNav = [
    {
        title:"Dashboard",
        admin:true,
        sub: [
            {
                to: "/dashboard/products",
                title: "List Products",
            },
            {
                to: "/dashboard/products/new",
                title: "New Product",
            },
            {
                to:"/dashboard/orders",
                title:"List Orders"
            },
            {
                to:"/dashboard/financial",
                title:"Financial"
            }
        ],
    }
]