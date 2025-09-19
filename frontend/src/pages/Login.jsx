import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-teal-700">
      <Card className="w-80">
        <CardContent className="p-6 flex flex-col gap-4">
          <h2 className="text-xl font-bold">Artisan Login</h2>
          <Input placeholder="Email" />
          <Input type="password" placeholder="Password" />
          <Button className="bg-yellow-500 hover:bg-yellow-600">Login</Button>
        </CardContent>
      </Card>
    </div>
  );
}