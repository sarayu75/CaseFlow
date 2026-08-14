function Entities({ entities }) {

if (!entities) return null;

return (
<div className="rounded-xl bg-white p-5 border">

<h3 className="mb-4 font-semibold">
Entity Intelligence
</h3>


<div className="grid md:grid-cols-2 gap-4">


<div>
<h4 className="font-medium">
People
</h4>

<ul className="text-sm text-gray-700">
{entities.people.map((item,index)=>(
<li key={index}>
👤 {typeof item === "object" ? `${item.name} (${item.role})` : item}
</li>
))}
</ul>

</div>


<div>
<h4 className="font-medium">
Objects
</h4>

<ul className="text-sm text-gray-700">
{entities.objects.map((item,index)=>(
<li key={index}>
🔎 {typeof item === "object" ? item.name : item}
</li>
))}
</ul>

</div>


<div>
<h4 className="font-medium">
Locations
</h4>

<ul className="text-sm text-gray-700">
{entities.locations.map((item,index)=>(
<li key={index}>
📍 {typeof item === "object" ? item.name : item}
</li>
))}
</ul>

</div>


<div>
<h4 className="font-medium">
Organizations
</h4>

<ul className="text-sm text-gray-700">
{entities.organizations.map((item,index)=>(
<li key={index}>
🏢 {typeof item === "object" ? item.name : item}
</li>
))}
</ul>

</div>


</div>

</div>
)

}

export default Entities;