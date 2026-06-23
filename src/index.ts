import assert from "node:assert";
import crypto from "node:crypto";
import OAuth from "oauth-1.0a";

import type {
	AddBookmarkParams,
	AddHighlightParams,
	Bookmark,
	Error,
	Folder,
	Highlight,
	ListParams,
	Meta,
	UpdateReadProgressParams,
	User,
} from "./types.js";

export class Instapaper {
	private baseUrl = "https://www.instapaper.com/api";
	private oauth: OAuth;
	readonly token: OAuth.Token;

	constructor({
		consumerKey,
		consumerSecret,
		token,
	}: {
		consumerKey: string;
		consumerSecret: string;
		token: OAuth.Token;
	}) {
		this.oauth = new OAuth({
			consumer: { key: consumerKey, secret: consumerSecret },
			signature_method: "HMAC-SHA1",
			hash_function: (base_string, key) =>
				crypto
					.createHmac("sha1", key)
					.update(base_string)
					.digest("base64"),
		});

		this.token = token;
	}

	static async fetchToken({
		consumerKey,
		consumerSecret,
		username,
		password,
	}: {
		consumerKey: string;
		consumerSecret: string;
		username: string;
		password: string;
	}): Promise<OAuth.Token> {
		const oauth = new OAuth({
			consumer: { key: consumerKey, secret: consumerSecret },
			signature_method: "HMAC-SHA1",
			hash_function: (base_string, key) =>
				crypto
					.createHmac("sha1", key)
					.update(base_string)
					.digest("base64"),
		});

		const responseText = await Instapaper.postForm(
			oauth,
			"https://www.instapaper.com/api/1/oauth/access_token",
			{
				x_auth_username: username,
				x_auth_password: password,
				x_auth_mode: "client_auth",
			},
		);

		const data = new URLSearchParams(responseText as string);
		const key = data.get("oauth_token");
		const secret = data.get("oauth_token_secret");

		assert(key && secret, "Token exchange failed: key or secret is null.");

		return { key, secret };
	}

	private static async postForm(
		oauth: OAuth,
		url: string,
		params: Record<string, any> = {},
		token?: OAuth.Token,
	): Promise<any> {
		const form = new URLSearchParams();
		for (const [key, val] of Object.entries(params)) {
			form.append(key, String(val));
		}

		const headers = oauth.toHeader(
			oauth.authorize({ url, method: "POST", data: params }, token),
		);

		const response = await fetch(url, {
			method: "POST",
			headers: new Headers({ ...headers }),
			body: form,
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`API error: ${response.status} ${errorText}`);
		}

		const contentType = response.headers.get("content-type") ?? "";
		return contentType.includes("application/json")
			? response.json()
			: response.text();
	}

	private request = <T>(endpoint: string, params = {}): Promise<T> =>
		Instapaper.postForm(
			this.oauth,
			this.baseUrl + endpoint,
			params,
			this.token,
		);

	verifyCredentials = () =>
		this.request<[User]>("/1/account/verify_credentials");

	bookmarks = {
		list: (params: ListParams = {}) =>
			this.request<(User | Bookmark | Folder | Error | Meta)[]>(
				"/1/bookmarks/list",
				params,
			),

		updateReadProgress: (params: UpdateReadProgressParams) =>
			this.request<[Bookmark]>(
				"/1/bookmarks/update_read_progress",
				params,
			),

		add: (params: AddBookmarkParams) =>
			this.request<[Bookmark]>("/1/bookmarks/add", params),

		delete: (bookmark_id: Bookmark["bookmark_id"]) =>
			this.request<never[]>("/1/bookmarks/delete", { bookmark_id }),

		star: (bookmark_id: Bookmark["bookmark_id"]) =>
			this.request<[Bookmark]>("/1/bookmarks/star", { bookmark_id }),

		unstar: (bookmark_id: Bookmark["bookmark_id"]) =>
			this.request<[Bookmark]>("/1/bookmarks/unstar", { bookmark_id }),

		archive: (bookmark_id: Bookmark["bookmark_id"]) =>
			this.request<[Bookmark]>("/1/bookmarks/archive", { bookmark_id }),

		unarchive: (bookmark_id: Bookmark["bookmark_id"]) =>
			this.request<[Bookmark]>("/1/bookmarks/unarchive", { bookmark_id }),

		move: (
			bookmark_id: Bookmark["bookmark_id"],
			folder_id: Folder["folder_id"],
		) =>
			this.request<[Bookmark]>("/1/bookmarks/move", {
				bookmark_id,
				folder_id,
			}),

		getText: (bookmark_id: Bookmark["bookmark_id"]) =>
			this.request<string>("/1/bookmarks/get_text", { bookmark_id }),
	};

	folders = {
		list: () => this.request<Folder[]>("/1/folders/list"),
		add: (title: string) =>
			this.request<[Folder]>("/1/folders/add", { title }),
		delete: (folder_id: Folder["folder_id"]) =>
			this.request<never[]>("/1/folders/delete", { folder_id }),
		setOrder: (order: string) =>
			this.request<Folder[]>("/1/folders/set_order", { order }),
	};

	highlights = {
		list: (bookmark_id: Bookmark["bookmark_id"]) =>
			this.request<Highlight[]>(
				`/1.1/bookmarks/${bookmark_id}/highlights`,
			),

		add: (params: AddHighlightParams) =>
			this.request<Highlight>(
				`/1.1/bookmarks/${params.bookmark_id}/highlight`,
				{ text: params.text, position: params.position },
			),

		delete: (highlight_id: string) =>
			this.request<never[]>(`/1.1/highlights/${highlight_id}/delete`),
	};
}
