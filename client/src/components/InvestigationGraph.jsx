import ReactFlow, {
  Background,
  Controls,
} from "reactflow";

import "reactflow/dist/style.css";


function InvestigationGraph({ relationships }) {

  if (!relationships || relationships.length === 0) {
    return null;
  }


  const nodes = [];
  const edges = [];


  const uniqueNodes = new Set();


  relationships.forEach((relation,index)=>{

    if (!uniqueNodes.has(relation.source)) {

      nodes.push({
        id: relation.source,
        position: {
          x: 100,
          y: index * 120
        },
        data:{
          label: relation.source
        }
      });

      uniqueNodes.add(relation.source);
    }


    if (!uniqueNodes.has(relation.target)) {

      nodes.push({
        id: relation.target,
        position:{
          x:400,
          y:index * 120
        },
        data:{
          label: relation.target
        }
      });

      uniqueNodes.add(relation.target);
    }


    edges.push({
      id:`edge-${index}`,
      source:relation.source,
      target:relation.target,
      label:relation.relationship
    });

  });



  return (
    <div className="h-[500px] w-full rounded-xl border bg-white overflow-hidden flex flex-col mb-8">

      <h3 className="p-5 font-semibold shrink-0">
        Investigation Graph
      </h3>

      <p className="px-5 pb-3 text-sm text-gray-500 shrink-0">
        Relationships extracted directly from the case report. Read-only —
        drag to rearrange, but connections reflect only what the AI found
        grounded in the evidence, not manual edits.
      </p>

      <div className="flex-1 min-h-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          nodesConnectable={false}
          edgesFocusable={false}
          nodesDraggable={true}
        >

          <Background />
          <Controls showInteractive={false} />

        </ReactFlow>
      </div>

    </div>
  );
}


export default InvestigationGraph;