use super::*;
use crate::errors::*;
use crate::states::*;
use anchor_lang::prelude::*;

pub fn handler(ctx: Context<DeleteBlogPost>, _title: String) -> Result<()> {
    let blog = &mut ctx.accounts.blog;

    blog.number_of_posts = blog
        .number_of_posts
        .checked_sub(1)
        .ok_or(BlogError::Underflow)?;

    Ok(())
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeleteBlogPost<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        mut,
        seeds = [&hash_string_content(&title), owner.key().as_ref()],
        bump,
        close = owner
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
