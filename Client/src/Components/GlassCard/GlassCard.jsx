const GlassCard = ({
  children,
  className = '',
}) => {
  return (
    <section className={`status-card ${className}`}>
      {children}
    </section>
  )
}

export default GlassCard
