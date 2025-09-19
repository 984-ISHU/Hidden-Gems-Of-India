import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Dashboard() {
  const [products, setProducts] = useState([
    { id: 1, name: "Handwoven Saree" },
    { id: 2, name: "Clay Pot" },
  ]);

  const addProduct = () => {
    const newId = products.length + 1;
    setProducts([...products, { id: newId, name: `Product ${newId}` }]);
  };

  return (
    <div className="min-h-screen bg-teal-700 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Artisan Dashboard</h1>

      {/* Products */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {products.map((p) => (
          <Card key={p.id} className="min-w-[150px] bg-yellow-400 text-black">
            <CardContent className="flex flex-col items-center justify-center h-24">
              <span className="text-xl">📦</span>
              <p className="text-sm mt-2">{p.name}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button className="bg-green-500 mt-4" onClick={addProduct}>
        + Add Product
      </Button>

      {/* Actions */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <Button className="bg-red-600">Create Ads</Button>
        <Button className="bg-yellow-500 text-black">Chat Bot</Button>
        <Button className="bg-teal-500">Events</Button>
      </div>
    </div>
  );
}