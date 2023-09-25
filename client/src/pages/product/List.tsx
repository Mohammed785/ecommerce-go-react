import ProductFilter from "@/components/Product/ProductFilter";
import ProductList from "@/components/Product/ProductList";
import ProductProvider from "@/context/ProductsContext";

function ProductListPage(){
    return <ProductProvider>
        <div className="w-full flex h-full">
            <ProductFilter/>
            <ProductList/>
        </div>
    </ProductProvider>
}

export default ProductListPage;