import { useContext } from 'react';
import { ShopContext } from './ShopContext';
import ProductCard from './ProductCard';

export default function ProductGrid() {
  const { products, currentCategory } = useContext(ShopContext);

  const filteredProducts = currentCategory === 'all' 
    ? products 
    : products.filter(p => p.cat === currentCategory);

  if (filteredProducts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-light)' }}>
        <p>No products in this category yet.</p>
      </div>
    );
  }

  return (
    <div className="products-grid">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}