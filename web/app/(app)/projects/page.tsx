import { EmptyState } from "@/components/empty-state";
import { FolderIcon } from "@/components/icons";
import { NewProjectDialog } from "@/components/new-project-dialog";
import { ProjectCard } from "@/components/project-card";
import { listProjectsWithCounts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await listProjectsWithCounts();

  return (
    <div className="safe-top mx-auto max-w-2xl px-4 py-6">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-[34px] font-extrabold tracking-tight text-text-primary">
          Projects
        </h1>
        <NewProjectDialog />
      </header>

      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderIcon size={40} />}
          title="No projects yet"
          hint="Create your first project."
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              name={project.name}
              color={project.color}
              total={project.total}
              done={project.done}
            />
          ))}
        </div>
      )}
    </div>
  );
}
