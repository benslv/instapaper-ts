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
	private authUrl = this.baseUrl + "/1/oauth/access_token";

	private oauth: OAuth;

	private username?: string;
	private password?: string;

	private token?: OAuth.Token;

	constructor({
		consumerKey,
		consumerSecret,
		username,
		password,
		token,
	}: {
		consumerKey: string;
		consumerSecret: string;
		username?: string;
		password?: string;
		token?: OAuth.Token;
	}) {
		this.oauth = new OAuth({
			consumer: {
				key: consumerKey,
				secret: consumerSecret,
			},
			signature_method: "HMAC-SHA1",
			hash_function: (base_string, key) =>
				crypto
					.createHmac("sha1", key)
					.update(base_string)
					.digest("base64"),
		});

		this.username = username;
		this.password = password;
		this.token = token;
	}

	private makeRequest = async (
		url: string,
		params: Record<string, any> = {},
		token?: OAuth.Token
	): Promise<any> => {
		const form = new URLSearchParams();
		for (const [key, val] of Object.entries(params)) {
			form.append(key, String(val));
		}

		const headers = this.oauth.toHeader(
			this.oauth.authorize(
				{
					url,
					method: "POST",
					data: params,
				},
				token
			)
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

		const contentType = response.headers.get("content-type") || "";
		if (contentType.includes("application/json")) {
			return response.json();
		} else {
			return response.text();
		}
	};

	private getAccessToken = async (): Promise<OAuth.Token> => {
		assert(
			this.username && this.password,
			"Please set username and password with setCredentials()."
		);

		const params = {
			x_auth_username: this.username,
			x_auth_password: this.password,
			x_auth_mode: "client_auth",
		};

		const responseText = await this.makeRequest(this.authUrl, params);

		const data = new URLSearchParams(responseText as string);
		const key = data.get("oauth_token");
		const secret = data.get("oauth_token_secret");

		assert(
			key && secret,
			"There was an error fetching the token. One or both of key and secret is null."
		);

		this.token = { key, secret };
		return this.token;
	};

	private request = async <T>(endpoint: string, params = {}): Promise<T> => {
		if (!this.token) {
			this.token = await this.getAccessToken();
		}

		const url = this.baseUrl + endpoint;
		return this.makeRequest(url, params, this.token);
	};

	setCredentials = (username: string, password: string): void => {
		this.username = username;
		this.password = password;
	};

	verifyCredentials = () =>
		this.request<[User]>("/1/account/verify_credentials");

	bookmarks = {
		list: (params: ListParams = {}) =>
			this.request<(User | Bookmark | Folder | Error | Meta)[]>(
				"/1/bookmarks/list",
				params
			),

		updateReadProgress: (params: UpdateReadProgressParams) =>
			this.request<[Bookmark]>(
				"/1/bookmarks/update_read_progress",
				params
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
			folder_id: Folder["folder_id"]
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
				`/1.1/bookmarks/${bookmark_id}/highlights`
			),

		add: (params: AddHighlightParams) =>
			this.request<Highlight>(
				`/1.1/bookmarks/${params.bookmark_id}/highlight`,
				{
					text: params.text,
					position: params.position,
				}
			),

		delete: (highlight_id: string) =>
			this.request<never[]>(`/1.1/highlights/${highlight_id}/delete`),
	};
}
