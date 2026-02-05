export function PageHeader({
	title,
	subtitle,
}: {
	title: string;
	subtitle?: string;
}) {
	return (
		<div className="flex flex-col">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl! font-bold tracking-tight">{title}</h1>
			</div>
			{subtitle && <p className="text-zinc-400 text-sm">{subtitle}</p>}
		</div>
	);
}
