import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, rowsPerPage }) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, totalItems);

  // totalPages could be 0 if totalItems is 0, ensure we show at least page 1
  const safeTotalPages = Math.max(1, totalPages);
  
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', alignItems: 'center', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '1rem' }}>
      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
        Showing {startItem}-{endItem} of {totalItems}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <button 
          className="btn btn-outline" 
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          style={{ padding: '0.25rem 0.75rem' }}
        >
          Previous
        </button>
        
        {Array.from({ length: safeTotalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            className={`btn ${currentPage === page ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => onPageChange(page)}
            style={{ padding: '0.25rem 0.75rem' }}
          >
            {page}
          </button>
        ))}

        <button 
          className="btn btn-outline" 
          disabled={currentPage >= safeTotalPages}
          onClick={() => onPageChange(currentPage + 1)}
          style={{ padding: '0.25rem 0.75rem' }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
