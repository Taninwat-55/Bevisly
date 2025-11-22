import type { ProofTask } from "@/types";

// ✅ Define a task type where 'title' is required, but 'id'/'job_id' are omitted
type TemplateTask = Omit<ProofTask, "id" | "job_id">; 

export interface JobTemplate {
  id: string;
  label: string;
  category: "Engineering" | "Design" | "Marketing" | "Product" | "Data";
  title: string;
  department: string;
  description: string;
  requirements: string;
  proof_tasks: TemplateTask[]; // ✅ Use the stricter type here
}

export const JOB_TEMPLATES: JobTemplate[] = [
  {
    id: "frontend-react",
    label: "Frontend Developer (React)",
    category: "Engineering",
    title: "Junior React Developer",
    department: "Frontend",
    description: "We are looking for a motivated React developer to build responsive UI components using TailwindCSS. You will work closely with our design team to implement pixel-perfect screens.",
    requirements: "- Strong knowledge of JavaScript/TypeScript\n- Experience with React & Hooks\n- Familiarity with Git\n- Eye for design details",
    proof_tasks: [{
      title: "Build a Responsive Navbar",
      description: "Create a responsive navigation bar that collapses into a hamburger menu on mobile. Use Tailwind CSS for styling.",
      expected_time: "1 hour",
      submission_type: "link",
      ai_tools_allowed: true,
      duration_minutes: 60
    }]
  },
  {
    id: "backend-node",
    label: "Backend Engineer (Node.js)",
    category: "Engineering",
    title: "Node.js API Engineer",
    department: "Backend",
    description: "Join our backend team to build scalable RESTful APIs using Node.js and Supabase (PostgreSQL). You will be responsible for database schema design and API security.",
    requirements: "- Node.js & Express\n- SQL knowledge\n- Understanding of REST principles",
    proof_tasks: [{
      title: "Create a User Auth API",
      description: "Build a simple Express route that validates a user registration JSON body and returns a success token.",
      expected_time: "45 mins",
      submission_type: "link",
      ai_tools_allowed: true,
      duration_minutes: 45
    }]
  },
  {
    id: "ui-designer",
    label: "UI/UX Designer",
    category: "Design",
    title: "Product Designer",
    department: "Design",
    description: "We need a creative designer to help shape the user experience of our new mobile app. You'll translate user needs into intuitive and attractive interfaces.",
    requirements: "- Proficiency in Figma\n- Understanding of user-centered design principles\n- Portfolio demonstrating mobile app design",
    proof_tasks: [{
      title: "Redesign a Login Screen",
      description: "Create a high-fidelity mockup of a login screen for a wellness app. Focus on accessibility, clean typography, and brand consistency.",
      expected_time: "1 hour",
      submission_type: "link",
      recommended_platform: "Figma",
      ai_tools_allowed: false,
      duration_minutes: 60
    }]
  },
  {
    id: "marketing-content",
    label: "Content Writer",
    category: "Marketing",
    title: "Content Marketing Specialist",
    department: "Marketing",
    description: "We are looking for a storyteller to craft compelling blog posts and social media content that engages our audience and drives traffic.",
    requirements: "- Excellent writing and editing skills\n- Basic SEO knowledge\n- Ability to adapt tone for different channels",
    proof_tasks: [{
      title: "Write a Launch Blog Post",
      description: "Write a 300-word blog post announcing a fictional new feature: 'Dark Mode'. Focus on benefits to the user and excitement.",
      expected_time: "45 mins",
      submission_type: "text",
      ai_tools_allowed: true,
      duration_minutes: 45
    }]
  }
];