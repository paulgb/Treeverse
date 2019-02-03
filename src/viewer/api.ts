
export interface APIResponse {
    globalObjects: {
        tweets: {
            [id: string]: {
                conversation_id_str: string,
                created_at: string,
                display_text_range: [number],
                favorite_count: number,
                text: string,
                id_str: string,
                in_reply_to_status_id_str: string,
                lang: string,
                possibly_sensitive_editable: boolean,
                reply_count: number,
                retweet_count: number,
                source: string,
                user_id_str: string
            }
        },
        users: {
            [id: string]: {
                name: string,
                screen_name: string,
                profile_image_url_https: string,
            }
        }
    },
    timeline: {
        instructions: [
            {
                addEntries: {
                    entries: [
                        {
                            entryId: string,
                            content: {
                                operation: {
                                    cursor: {
                                        cursorType: string,
                                        value: string
                                    }
                                },
                                item: {
                                    content: {
                                        tweet: {
                                            displayType: string,
                                            id: string
                                        }
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        ]
    }
}