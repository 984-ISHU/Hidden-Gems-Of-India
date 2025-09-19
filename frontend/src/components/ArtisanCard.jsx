import { Card, CardContent } from "@/components/ui/card";

export default function ArtisanCard({ artisan }) {
  return (
    <Card className="bg-yellow-400 aspect-square flex flex-col items-center justify-center p-3">
      <CardContent className="flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-gray-200 mb-2"></div>
        <h3 className="font-semibold">{artisan.name}</h3>
        <p className="text-sm">{artisan.skill}</p>
        <p className="text-xs italic">{artisan.location}</p>
      </CardContent>
    </Card>
  );
}