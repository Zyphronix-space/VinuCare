import { useContext } from 'react';
import { ShopContext } from './ShopContext';

export default function FilterButtons() {
  const { currentCategory, setCurrentCategory } = useContext(ShopContext);

  const categories = [
    { id: 'all', label: 'All Products' },
    { id: 'dogs', label: '🐶 Dogs' },
    { id: 'cats', label: '🐱 Cats' },
    { id: 'birds', label: '🐦 Birds' },
    { id: 'fish', label: '🐠 Fish' },
    { id: 'cows', label: '🐄 Cows' },
    { id: 'goats', label: '🐐 Goats' },
    { id: 'small', label: '🐹 Small Pets' }
  ];

  return (
    <div className="shop-filters">
      {categories.map((cat) => (
        <button
          key={cat.id}
          className={`filter-btn ${currentCategory === cat.id ? 'active' : ''}`}
          onClick={() => setCurrentCategory(cat.id)}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}