use super::*;
use crate::errors::*;
use crate::states::*;
use anchor_lang::{prelude::*, solana_program::clock::UnixTimestamp};

pub fn handler(ctx: Context<CreateBlogPost>, title: String, content: String) -> Result<()> {
    let blog_key = ctx.accounts.blog.key();
    let blog_post = &mut ctx.accounts.blog_post;
    let blog = &mut ctx.accounts.blog;

    blog_post.owner = ctx.accounts.owner.key();
    blog_post.blog = blog_key;
    blog_post.title = title;
    blog_post.content = content;
    blog_post.number_of_comments = 0;
    blog_post.created_at = Clock::get().unwrap().unix_timestamp;
    blog_post.bump = ctx.bumps.blog_post;

    blog.number_of_posts = blog
        .number_of_posts
        .checked_add(1)
        .ok_or(BlogError::Overflow)?;

    Ok(())
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreateBlogPost<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        init,
        payer = owner,
        space = 8 + BlogPost::INIT_SPACE,
        seeds = [&hash_string_content(&title), owner.key().as_ref()],
        bump
    )]
    pub blog_post: Account<'info, BlogPost>,
    #[account(
        mut,
        seeds = [blog.title.as_bytes(), blog.owner.key().as_ref()],
        bump,
        constraint = blog.owner == owner.key() @ BlogError::UnauthorizedOwner,
        has_one = owner
    )]
    pub blog: Account<'info, Blog>,
    pub system_program: Program<'info, System>,
}
