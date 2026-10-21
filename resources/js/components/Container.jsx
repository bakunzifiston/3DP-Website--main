export default function Container({ as: Tag = 'div', className = '', children, ...props }) {
  return (
    <Tag className={`mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 ${className}`} {...props}>
      {children}
    </Tag>
  );
}
