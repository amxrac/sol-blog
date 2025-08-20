use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Blog {
    pub owner: Pubkey,
    #[max_len(32)]
    pub title: String,
    #[max_len(100)]
    pub description: String,
    pub number_of_posts: u64,
    pub created_at: i64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct BlogPost {
    pub owner: Pubkey,
    pub blog: Pubkey,
    #[max_len(50)]
    pub title: String,
    #[max_len(5000)]
    pub content: String,
    pub number_of_comments: u64,
    pub created_at: i64,
    pub updated_at: i64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Comment {
    pub comment_author: Pubkey,
    pub blog_post: Pubkey,
    pub blog: Pubkey,
    #[max_len(300)]
    pub content: String,
    pub created_at: i64,
    pub bump: u8,
}
