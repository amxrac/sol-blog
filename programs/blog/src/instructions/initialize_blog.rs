use crate::states::*;
use anchor_lang::{prelude::*, solana_program::clock::UnixTimestamp};

pub fn handler(ctx: Context<InitializeBlog>, title: String, description: String) -> Result<()> {
    let blog = &mut ctx.accounts.blog;
    blog.owner = ctx.accounts.owner.key();
    blog.title = title;
    blog.description = description;
    blog.bump = ctx.bumps.blog;
    blog.number_of_posts = 0;
    blog.created_at = Clock::get().unwrap().unix_timestamp;

    Ok(())
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct InitializeBlog<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        init,
        payer = owner,
        space = 8 + Blog::INIT_SPACE,
        seeds = [title.as_bytes(), owner.key().as_ref()],
        bump
    )]
    pub blog: Account<'info, Blog>,
    pub system_program: Program<'info, System>,
}
