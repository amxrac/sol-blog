use super::*;
use super::*;
use crate::errors::*;
use crate::states::*;
use anchor_lang::{prelude::*, solana_program::clock::UnixTimestamp};

pub fn handler(ctx: Context<UpdateBlogPost>, _title: String, content: String) -> Result<()> {
    let blog_post = &mut ctx.accounts.blog_post;

    blog_post.content = content;
    blog_post.updated_at = Clock::get().unwrap().unix_timestamp;

    Ok(())
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct UpdateBlogPost<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        mut,
        seeds = [&hash_string_content(&title), owner.key().as_ref()],
        bump,
    )]
    pub blog_post: Account<'info, BlogPost>,
    #[account(
        mut,
        seeds = [blog.title.as_bytes(), blog.owner.key().as_ref()],
        bump,
        constraint = blog.owner == owner.key() @ BlogError::UnauthorizedOwner
    )]
    pub blog: Account<'info, Blog>,
    pub system_program: Program<'info, System>,
}
