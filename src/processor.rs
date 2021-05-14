use solana_program::{
    account_info::{next_account_info ,AccountInfo}, entrypoint::ProgramResult, pubkey::Pubkey
};

pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8]
) -> ProgramResult {
    let account_iter = &mut accounts.iter();

    let src = next_account_info(account_iter)?;
    let dest = next_account_info(account_iter)?;

    **src.try_borrow_mut_lamports()? -= 5;
    **dest.try_borrow_mut_lamports()? += 5;

    Ok(())
}