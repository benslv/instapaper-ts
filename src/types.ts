export type Bookmark = {
	type: "bookmark";
	hash: string;
	description: string;
	tags: Array<Tag>;
	bookmark_id: number;
	private_source: string;
	title: string;
	url: string;
	progress_timestamp: number;
	time: number;
	progress: number;
	starred: "0" | "1";
};

export type Folder = {
	type: "folder";
	position: number;
	folder_id: number;
	title: string;
	display_title: string;
	slug: string;
	sync_to_mobile: 0 | 1;
	public: false | 1;
};

export type Tag = {
	id: number;
	name: string;
};

export type Highlight = {
	type: "highlight";
	highlight_id: number;
	text: string;
	note: string | null;
	bookmark_id: Bookmark["bookmark_id"];
	time: number;
	position: number;
};

export type ListParams = Partial<{
	limit: number;
	folder_id: "unread" | "starred" | "archive" | (string & {});
	have: string;
	highlights: string;
}>;

export type UpdateReadProgressParams = {
	bookmark_id: string;
	progress: number;
	progress_timestamp: number;
};

export type AddBookmarkParams = {
	url: string;
	title?: string;
	description?: string;
	folder_id?: number;
	resolve_final_url?: 0 | 1;
	archived?: 0 | 1;
	tags?: Array<{ name: string }>;

	// TODO: Properly discriminate this type.
	is_private_from_source?: string;
	content?: string;
};

export type AddHighlightParams = {
	bookmark_id: string;
	text: string;
	position?: number;
};
