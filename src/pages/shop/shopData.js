import rcPuppy        from '../../assets/products/rc-puppy.webp';
import rcDogAdult     from '../../assets/products/rc-dog-adult.jpg';
import rcCatAdult     from '../../assets/products/rc-cat-adult.jpg';
import rcKitten       from '../../assets/products/rc-kitten.webp';
import vlBudgie       from '../../assets/products/vl-budgie-mix.jpg';
import taiyoFish      from '../../assets/products/taiyo-fish-food.png';
import tetraGoldfish  from '../../assets/products/tetra-goldfish.avif';
import cattleMineral  from '../../assets/products/cattle-mineral-block.jpg';
import udderCream     from '../../assets/products/udder-cream.jpg';
import goatPellets    from '../../assets/products/goat-pellets.webp';

export const products = [
  { id:1,  name:"Royal Canin Puppy",          desc:"Complete nutrition for puppies up to 12 months",       price:9500,  img:rcPuppy,       cat:"dogs",  badge:"Best Seller",  rating:"4.9" },
  { id:2,  name:"Royal Canin Adult Dog",       desc:"Balanced dry food for adult dogs — 4kg",              price:8900,  img:rcDogAdult,    cat:"dogs",  badge:"Vet Choice",   rating:"4.8" },
  { id:3,  name:"Royal Canin Adult Cat",       desc:"Complete nutrition for adult cats — 4kg",             price:7800,  img:rcCatAdult,    cat:"cats",  badge:"Best Seller",  rating:"4.9" },
  { id:4,  name:"Royal Canin Kitten",          desc:"Tailored nutrition for kittens up to 12 months",     price:7200,  img:rcKitten,      cat:"cats",  badge:"Popular",      rating:"4.8" },
  { id:5, name:"VL Budgie Mix",               desc:"Premium seed blend for budgerigars — 1kg",           price:1100,  img:vlBudgie,      cat:"birds", badge:null,           rating:"4.7" },
  { id:6, name:"Taiyo Fish Food",             desc:"High-protein growth formula for all fish — 100g",   price:850,   img:taiyoFish,     cat:"fish",  badge:null,           rating:"4.7" },
  { id:7, name:"Tetra Goldfish Flakes",       desc:"Color-enhancing flakes for goldfish — 200g",        price:950,   img:tetraGoldfish, cat:"fish",  badge:"Essential",    rating:"4.8" },
  { id:8, name:"Cattle Mineral Block",        desc:"Salt & mineral lick block — 2kg",                   price:2200,  img:cattleMineral, cat:"cows",  badge:null,           rating:"4.6" },
  { id:9, name:"Udder Health Cream",          desc:"Lanolin-based teat dip & conditioner 250ml",        price:2800,  img:udderCream,    cat:"cows",  badge:"Vet Approved", rating:"4.9" },
  { id:10, name:"Goat Grain Pellets",          desc:"Balanced grain feed — 5kg bag",                     price:3200,  img:goatPellets,   cat:"goats", badge:null,           rating:"4.7" },
];