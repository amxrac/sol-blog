use anchor_lang::prelude::*;

#[error_code]
pub enum BlogError {
    #[msg("Unauthorized action.")]
    UnauthorizedOwner,
    #[msg("Underflow error")]
    Underflow,
    #[msg("Overflow error")]
    Overflow,
}
