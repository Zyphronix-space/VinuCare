export default function CartItem({item}){

return(

<div className="cart-item">

<img

src={item.image}

alt={item.name}

/>

<div>

<h4>{item.name}</h4>

<p>

${item.price}

</p>

</div>

</div>

);

}