function RelationshipGraph({ relationships }) {

if (!relationships || relationships.length === 0) {
    return null;
}


return (
<div className="rounded-xl bg-white p-5 border">

<h3 className="mb-4 font-semibold">
Investigation Connections
</h3>


<div className="space-y-4">

{relationships.map((relation,index)=>(

<div 
key={index}
className="rounded-lg bg-slate-50 p-4"
>

<div className="flex items-center gap-3">

<span className="font-semibold">
{relation.source}
</span>

<span className="text-gray-500">
→ {relation.relationship} →
</span>

<span className="font-semibold">
{relation.target}
</span>

</div>


<p className="mt-2 text-sm text-gray-600">
{relation.context}
</p>


</div>

))}

</div>

</div>
)

}


export default RelationshipGraph;