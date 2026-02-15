export interface TeamMember {
  id: string;
  name: string;
  title: string;
  image: string;
}

export const teamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Laila Abdul Rahman",
    title: "Founder",
    image: "/assets/laila.jpg",
  },
  {
    id: "2",
    name: "Solomon Kankam",
    title: "CTO",
    image: "/assets/solomon.jpg",
  },
  {
    id: "3",
    name: "Grey Owusu Agyarko",
    title: "Legal",
    image: "/assets/grey.jpg",
  },
  {
    id: "4",
    name: "Sally Reigns",
    title: "Trip Coordinator/Tourguide",
    image: "/assets/sally.jpg",
  },
];

