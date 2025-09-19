import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const [profile, setProfile] = useState({
    username: "Aarti Sharma",
    email: "aarti@example.com",
    password: "",
    skill: "Handloom Weaving",
    location: "Varanasi",
  });

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-teal-700">
      <Card className="w-96 bg-white">
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-300 mx-auto"></div>
          <Input name="username" value={profile.username} onChange={handleChange} />
          <Input name="email" value={profile.email} onChange={handleChange} />
          <Input
            type="password"
            name="password"
            value={profile.password}
            onChange={handleChange}
            placeholder="Update Password"
          />
          <Input name="skill" value={profile.skill} onChange={handleChange} />
          <Input name="location" value={profile.location} onChange={handleChange} />

          <div className="bg-red-200 p-3 rounded text-center font-semibold">
            AI Generated Artisan’s Story:  
            <p className="text-sm italic mt-1">
              {profile.username} is a skilled {profile.skill} artisan from{" "}
              {profile.location}.
            </p>
          </div>

          <Button className="bg-yellow-500 text-black">Save Profile</Button>
        </CardContent>
      </Card>
    </div>
  );
}